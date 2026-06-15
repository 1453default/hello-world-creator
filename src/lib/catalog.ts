import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_featured: boolean;
  display_order: number;
};

export type ProductImage = { url: string; is_primary: boolean; display_order: number };

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  storage: string | null;
  ram: string | null;
  color: string | null;
  condition: string;
  selling_price: number;
  is_featured: boolean;
  created_at: string;
  brand: { name: string; slug: string } | null;
  images: ProductImage[];
  available_count: number;
};

const PRODUCT_SELECT = `
  id, name, slug, storage, ram, color, condition, selling_price, is_featured, created_at,
  brand:brands ( name, slug ),
  images:product_images ( url, is_primary, display_order ),
  inventory:inventory_units ( id, status )
`;

function shapeProduct(row: any): ProductCard {
  const inv = (row.inventory ?? []) as { status: string }[];
  return {
    ...row,
    selling_price: Number(row.selling_price),
    images: (row.images ?? []).sort(
      (a: ProductImage, b: ProductImage) =>
        Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order,
    ),
    available_count: inv.filter((u) => u.status === "AVAILABLE").length,
  };
}

export const brandsQuery = queryOptions({
  queryKey: ["brands"],
  queryFn: async (): Promise<Brand[]> => {
    const { data, error } = await supabase
      .from("brands")
      .select("id,name,slug,logo_url,is_featured,display_order")
      .eq("is_visible", true)
      .order("display_order");
    if (error) throw error;
    return data as Brand[];
  },
  staleTime: 60_000,
});

export const allProductsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: async (): Promise<ProductCard[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_listed", true)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(shapeProduct);
  },
  staleTime: 30_000,
});

export const productBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<ProductCard | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT + ", description, model, category")
        .eq("slug", slug)
        .eq("is_listed", true)
        .eq("is_deleted", false)
        .maybeSingle();
      if (error) throw error;
      return data ? (shapeProduct(data) as ProductCard & { description: string }) : null;
    },
  });
