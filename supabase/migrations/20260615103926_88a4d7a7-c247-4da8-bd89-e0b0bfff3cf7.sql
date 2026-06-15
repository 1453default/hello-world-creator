
-- ENUMS
CREATE TYPE inventory_status AS ENUM ('AVAILABLE','RESERVED','SOLD','DEFECTIVE','DELETED');
CREATE TYPE app_role AS ENUM ('super_admin','admin','staff');
CREATE TYPE payment_method AS ENUM ('CASH','UPI','CARD','BANK_TRANSFER','EMI');
CREATE TYPE condition_type AS ENUM ('like_new','good','fair','poor');
CREATE TYPE bill_status AS ENUM ('DRAFT','COMPLETED','CANCELLED');

-- Helper: updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- SHOP SETTINGS
CREATE TABLE public.shop_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shop_settings TO anon, authenticated;
GRANT ALL ON public.shop_settings TO authenticated, service_role;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_settings" ON public.shop_settings FOR SELECT USING (true);
CREATE POLICY "auth_write_settings" ON public.shop_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- BRANDS
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  display_order int NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT ALL ON public.brands TO authenticated, service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_brands" ON public.brands FOR SELECT USING (is_visible = true);
CREATE POLICY "auth_read_brands" ON public.brands FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_brands" ON public.brands FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_brands_updated BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES public.brands(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  model text,
  category text NOT NULL DEFAULT 'Smartphone',
  storage text,
  ram text,
  color text,
  condition condition_type NOT NULL DEFAULT 'good',
  description text,
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  purchase_price numeric(10,2),
  is_featured boolean NOT NULL DEFAULT false,
  is_listed boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO authenticated, service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_products" ON public.products FOR SELECT USING (is_listed = true AND is_deleted = false);
CREATE POLICY "auth_read_products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_is_listed ON public.products(is_listed);

-- PRODUCT IMAGES
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT ALL ON public.product_images TO authenticated, service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "auth_write_images" ON public.product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- INVENTORY UNITS
CREATE TABLE public.inventory_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  unit_code text UNIQUE,
  imei text,
  imei2 text,
  condition condition_type NOT NULL DEFAULT 'good',
  purchase_price numeric(10,2),
  selling_price numeric(10,2) NOT NULL,
  status inventory_status NOT NULL DEFAULT 'AVAILABLE',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.inventory_units TO anon, authenticated;
GRANT ALL ON public.inventory_units TO authenticated, service_role;
ALTER TABLE public.inventory_units ENABLE ROW LEVEL SECURITY;
-- Public sees only availability (no prices revealed beyond product)
CREATE POLICY "public_read_available_units" ON public.inventory_units FOR SELECT USING (status = 'AVAILABLE');
CREATE POLICY "auth_read_units" ON public.inventory_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_units" ON public.inventory_units FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_units_updated BEFORE UPDATE ON public.inventory_units FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_inventory_status ON public.inventory_units(status);
CREATE INDEX idx_inventory_product_id ON public.inventory_units(product_id);

-- USER PROFILES
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  is_active boolean NOT NULL DEFAULT true,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_update_own_profile" ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- USER ROLES (separate table, security-definer check)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_own_roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff');
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- BILLS
CREATE TABLE public.bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number text UNIQUE NOT NULL,
  customer_name text,
  customer_phone text,
  payment_method payment_method NOT NULL DEFAULT 'CASH',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  grand_total numeric(10,2) NOT NULL DEFAULT 0,
  status bill_status NOT NULL DEFAULT 'COMPLETED',
  notes text,
  created_by uuid REFERENCES public.user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bills TO authenticated;
GRANT ALL ON public.bills TO service_role;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_bills" ON public.bills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_bills_created_at ON public.bills(created_at);
CREATE TRIGGER trg_bills_updated BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BILL ITEMS
CREATE TABLE public.bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  inventory_unit_id uuid REFERENCES public.inventory_units(id),
  product_id uuid REFERENCES public.products(id),
  snapshot_product_name text NOT NULL,
  snapshot_brand_name text,
  snapshot_storage text,
  snapshot_color text,
  snapshot_condition text,
  snapshot_imei text,
  unit_price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bill_items TO authenticated;
GRANT ALL ON public.bill_items TO service_role;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_bill_items" ON public.bill_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_audit" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_audit_created_at ON public.audit_logs(created_at);
