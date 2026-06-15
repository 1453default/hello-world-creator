import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({ meta: [{ title: "Reports · Admin" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const [{ data: bills }, { data: units }, { data: items }] = await Promise.all([
        supabase.from("bills").select("grand_total, discount, created_at, payment_method").eq("status", "COMPLETED"),
        supabase.from("inventory_units").select("status, cost_price, product:products(selling_price, brand:brands(name))"),
        supabase.from("bill_items").select("product:products(name, brand:brands(name)), line_total, quantity"),
      ]);
      const now = Date.now();
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const weekStart = now - 7 * 86400000;
      const monthStart = now - 30 * 86400000;
      const sum = (xs: any[], days?: number) => xs.filter((b) => !days || +new Date(b.created_at) > now - days * 86400000).reduce((s, b) => s + Number(b.grand_total), 0);

      const available = (units ?? []).filter((u: any) => u.status === "AVAILABLE");
      const stockValue = available.reduce((s: number, u: any) => s + Number(u.product?.selling_price ?? 0), 0);
      const stockCost = available.reduce((s: number, u: any) => s + Number(u.cost_price ?? 0), 0);

      const topMap = new Map<string, { name: string; qty: number; revenue: number }>();
      for (const it of items ?? []) {
        const p: any = it.product;
        if (!p) continue;
        const key = `${p.brand?.name ?? ""} ${p.name}`;
        const cur = topMap.get(key) ?? { name: key, qty: 0, revenue: 0 };
        cur.qty += Number(it.quantity);
        cur.revenue += Number(it.line_total);
        topMap.set(key, cur);
      }
      const top = Array.from(topMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

      return {
        today: sum(bills ?? [], 1),
        week: sum(bills ?? [], 7),
        month: sum(bills ?? [], 30),
        allTime: sum(bills ?? []),
        billsCount: (bills ?? []).length,
        availableCount: available.length,
        stockValue,
        stockCost,
        top,
      };
    },
  });

  if (!data) return <div className="text-admin-muted">Loading…</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Reports</h1>
        <p className="text-sm text-admin-muted">Sales and inventory analytics</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Today" value={formatINR(data.today)} />
        <Stat label="Last 7 days" value={formatINR(data.week)} />
        <Stat label="Last 30 days" value={formatINR(data.month)} />
        <Stat label="All time" value={formatINR(data.allTime)} sub={`${data.billsCount} bills`} />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Available units" value={String(data.availableCount)} />
        <Stat label="Stock value (sell)" value={formatINR(data.stockValue)} />
        <Stat label="Stock cost" value={formatINR(data.stockCost)} sub={`Margin ${formatINR(data.stockValue - data.stockCost)}`} />
      </section>

      <section className="rounded-xl border border-admin-border bg-admin-surface p-5">
        <h2 className="font-display font-bold mb-3">Top sellers</h2>
        {data.top.length === 0 ? (
          <p className="text-sm text-admin-muted">No sales yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-admin-muted">
              <tr><th className="py-2">Product</th><th className="py-2">Qty</th><th className="py-2 text-right">Revenue</th></tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {data.top.map((t) => (
                <tr key={t.name}><td className="py-2">{t.name}</td><td className="py-2">{t.qty}</td><td className="py-2 text-right font-num font-semibold">{formatINR(t.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-admin-muted">{label}</div>
      <div className="mt-2 text-2xl font-bold font-num text-amber">{value}</div>
      {sub && <div className="mt-1 text-xs text-admin-muted">{sub}</div>}
    </div>
  );
}
