import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/bills")({
  head: () => ({ meta: [{ title: "Bills · Admin" }] }),
  component: BillsPage,
});

type Bill = {
  id: string;
  bill_number: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  grand_total: number;
  discount: number;
  payment_method: string | null;
  status: string;
  created_at: string;
};

function BillsPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["admin", "bills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bills").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data as Bill[];
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ["admin", "bill-items", selected],
    enabled: !!selected,
    queryFn: async () => {
      const { data } = await supabase.from("bill_items").select("*").eq("bill_id", selected!);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Bills</h1>
        <p className="text-sm text-admin-muted">{bills.length} recent transactions</p>
      </header>
      <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted">
            <tr>
              <th className="px-4 py-3">Bill #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">Loading…</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">No bills yet.</td></tr>
            ) : (
              bills.map((b) => (
                <tr key={b.id} onClick={() => setSelected(b.id === selected ? null : b.id)} className={`cursor-pointer hover:bg-admin-surface-2/50 ${selected === b.id ? "bg-admin-surface-2" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs">{b.bill_number}</td>
                  <td className="px-4 py-3">{b.customer_name ?? "—"}<div className="text-xs text-admin-muted">{b.customer_phone}</div></td>
                  <td className="px-4 py-3 text-admin-muted">{new Date(b.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="rounded bg-admin-surface-2 px-2 py-1 text-xs">{b.payment_method ?? "—"}</span></td>
                  <td className="px-4 py-3 font-num font-bold text-amber">{formatINR(b.grand_total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && items.length > 0 && (
        <div className="rounded-xl border border-admin-border bg-admin-surface p-4">
          <h3 className="mb-3 font-display font-bold">Bill items</h3>
          <ul className="space-y-1 text-sm">
            {items.map((i: any) => (
              <li key={i.id} className="flex justify-between border-b border-admin-border py-2">
                <span>{i.description}</span>
                <span className="font-num">{formatINR(i.line_total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
