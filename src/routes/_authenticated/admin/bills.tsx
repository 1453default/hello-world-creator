import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, Printer, Download } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";
import { exportToXLSX } from "@/lib/xlsx-export";

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

  async function exportAll() {
    try {
      const { data, error } = await supabase
        .from("bills")
        .select("bill_number, customer_name, customer_phone, payment_method, status, subtotal, discount, tax, grand_total, created_at, notes")
        .order("created_at", { ascending: false });
      if (error) throw error;
      exportToXLSX(
        (data ?? []).map((b: any) => ({
          "Bill #": b.bill_number ?? "",
          "Customer": b.customer_name ?? "",
          "Phone": b.customer_phone ?? "",
          "Payment": b.payment_method ?? "",
          "Status": b.status ?? "",
          "Subtotal": Number(b.subtotal ?? 0),
          "Discount": Number(b.discount ?? 0),
          "Tax": Number(b.tax ?? 0),
          "Grand Total": Number(b.grand_total ?? 0),
          "Date": new Date(b.created_at).toLocaleString(),
          "Notes": b.notes ?? "",
        })),
        "Bills",
        "used-mobiles-bills",
      );
      toast.success(`Exported ${data?.length ?? 0} bills`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Bills</h1>
          <p className="text-sm text-admin-muted">{bills.length} recent transactions</p>
        </div>
        <button onClick={exportAll} className="inline-flex h-10 items-center gap-2 rounded-md border border-admin-border bg-admin-surface px-4 text-sm font-semibold text-admin-text hover:border-amber/40">
          <Download className="h-4 w-4" /> Export XLSX
        </button>
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
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-admin-muted">Loading…</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-admin-muted">No bills yet.</td></tr>
            ) : (
              bills.map((b) => (
                <tr key={b.id} className={`hover:bg-admin-surface-2/50 ${selected === b.id ? "bg-admin-surface-2" : ""}`}>
                  <td onClick={() => setSelected(b.id === selected ? null : b.id)} className="cursor-pointer px-4 py-3 font-mono text-xs">{b.bill_number}</td>
                  <td onClick={() => setSelected(b.id === selected ? null : b.id)} className="cursor-pointer px-4 py-3">{b.customer_name ?? "—"}<div className="text-xs text-admin-muted">{b.customer_phone}</div></td>
                  <td className="px-4 py-3 text-admin-muted">{new Date(b.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="rounded bg-admin-surface-2 px-2 py-1 text-xs">{b.payment_method ?? "—"}</span></td>
                  <td className="px-4 py-3 font-num font-bold text-amber">{formatINR(b.grand_total)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/receipt/$id"
                      params={{ id: b.id }}
                      target="_blank"
                      title="View Receipt"
                      className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <a
                      href={`/receipt/${b.id}?print=1`}
                      target="_blank"
                      rel="noopener"
                      title="Print Receipt"
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-admin-surface-2 hover:text-amber"
                    >
                      <Printer className="h-4 w-4" />
                    </a>
                  </td>
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
