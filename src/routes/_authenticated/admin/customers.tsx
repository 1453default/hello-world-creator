import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  head: () => ({ meta: [{ title: "Customers · Admin" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const { data } = await supabase.from("bills").select("customer_name, customer_phone, grand_total, created_at");
      const map = new Map<string, { name: string; phone: string; orders: number; spend: number; last: string }>();
      for (const b of data ?? []) {
        const key = (b.customer_phone || b.customer_name || "guest").toString();
        const cur = map.get(key) ?? { name: b.customer_name ?? "Guest", phone: b.customer_phone ?? "", orders: 0, spend: 0, last: b.created_at };
        cur.orders += 1;
        cur.spend += Number(b.grand_total);
        if (b.created_at > cur.last) cur.last = b.created_at;
        map.set(key, cur);
      }
      return Array.from(map.values()).sort((a, b) => b.spend - a.spend);
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="text-sm text-admin-muted">Derived from bills · {customers.length} unique</p>
      </header>
      <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Total Spend</th><th className="px-4 py-3">Last Visit</th></tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">Loading…</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">No customers yet.</td></tr>
            ) : customers.map((c, i) => (
              <tr key={i}>
                <td className="px-4 py-3 font-semibold">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.phone}</td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3 font-num text-amber font-bold">{formatINR(c.spend)}</td>
                <td className="px-4 py-3 text-admin-muted">{new Date(c.last).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
