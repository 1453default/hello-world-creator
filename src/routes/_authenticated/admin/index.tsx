import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";
import { Boxes, ShoppingCart, Smartphone, Tags, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Dashboard · USED MOBILES Admin" }] }),
  component: DashboardPage,
});

type Kpis = {
  brands: number;
  products: number;
  availableUnits: number;
  soldToday: number;
  revenueToday: number;
};

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard-kpis"],
    queryFn: async (): Promise<Kpis> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const iso = today.toISOString();

      const [brands, products, available, billsToday] = await Promise.all([
        supabase.from("brands").select("id", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false),
        supabase
          .from("inventory_units")
          .select("id", { count: "exact", head: true })
          .eq("status", "AVAILABLE"),
        supabase
          .from("bills")
          .select("grand_total")
          .eq("status", "COMPLETED")
          .gte("created_at", iso),
      ]);

      const revenueToday = (billsToday.data ?? []).reduce(
        (sum, b: { grand_total: number | string }) => sum + Number(b.grand_total ?? 0),
        0,
      );

      return {
        brands: brands.count ?? 0,
        products: products.count ?? 0,
        availableUnits: available.count ?? 0,
        soldToday: billsToday.data?.length ?? 0,
        revenueToday,
      };
    },
  });

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-admin-text">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-admin-muted">
            Real-time snapshot of today's counter operations.
          </p>
        </div>
        <Link
          to="/admin/pos"
          className="hidden sm:inline-flex h-10 items-center gap-2 rounded-md bg-amber px-4 text-sm font-bold text-ink hover:bg-amber-dark transition"
        >
          <ShoppingCart className="h-4 w-4" /> Open POS
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Available Units" value={data?.availableUnits ?? 0} icon={Boxes} loading={isLoading} accent="emerald" />
        <Kpi label="Bills Today" value={data?.soldToday ?? 0} icon={ShoppingCart} loading={isLoading} accent="amber" />
        <Kpi
          label="Revenue Today"
          value={formatINR(data?.revenueToday ?? 0)}
          icon={ShoppingCart}
          loading={isLoading}
          accent="info"
          mono
        />
        <Kpi label="Active Products" value={data?.products ?? 0} icon={Smartphone} loading={isLoading} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <QuickAction to="/admin/inventory" icon={Boxes} title="Manage Inventory" desc="Add new units, update IMEIs, change status" />
        <QuickAction to="/admin/products" icon={Smartphone} title="Add Product" desc="Create model with specs and images" />
        <QuickAction to="/admin/brands" icon={Tags} title="Brands" desc="Logos, ordering, visibility" />
      </section>

    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  loading,
  accent = "default",
  mono,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  accent?: "default" | "emerald" | "amber" | "info";
  mono?: boolean;
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald"
      : accent === "amber"
        ? "text-amber"
        : accent === "info"
          ? "text-info"
          : "text-admin-text";
  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-admin-muted">
          {label}
        </div>
        <Icon className={`h-4 w-4 ${accentClass}`} />
      </div>
      <div className={`mt-3 text-2xl font-bold ${accentClass} ${mono ? "font-mono" : ""}`}>
        {loading ? <span className="text-admin-subtle">—</span> : value}
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-xl border border-admin-border bg-admin-surface p-5 transition hover:border-amber/40 hover:bg-admin-surface-2"
    >
      <div className="grid h-9 w-9 place-items-center rounded-md bg-admin-surface-2 text-amber">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="font-display text-sm font-semibold text-admin-text">{title}</div>
          <ArrowRight className="h-4 w-4 text-admin-subtle transition group-hover:translate-x-0.5 group-hover:text-amber" />
        </div>
        <div className="mt-0.5 text-xs text-admin-muted">{desc}</div>
      </div>
    </Link>
  );
}
