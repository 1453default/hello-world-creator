import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Eye, Printer, Download, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";
import { exportToXLSX } from "@/lib/xlsx-export";

export const Route = createFileRoute("/_authenticated/admin/bills")({
  head: () => ({ meta: [{ title: "Bills · Admin" }] }),
  component: BillsPage,
});

type BillItem = {
  id: string;
  description: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  inventory_unit: { imei: string | null; imei2: string | null; serial: string | null } | null;
  product: { name: string | null; model: string | null; brand: { name: string | null } | null } | null;
};

type Bill = {
  id: string;
  bill_number: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  grand_total: number;
  payment_method: string | null;
  status: string;
  created_at: string;
  items: BillItem[];
};

type PaymentFilter = "all" | "cash" | "upi" | "card" | "other";

function productLabel(it: BillItem): string {
  if (it.product) {
    const brand = it.product.brand?.name ?? "";
    const name = it.product.name ?? it.product.model ?? "";
    return `${brand} ${name}`.trim() || (it.description ?? "—");
  }
  return it.description ?? "—";
}

function BillsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState<PaymentFilter>("all");

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["admin", "bills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bills")
        .select(
          "id, bill_number, customer_name, customer_phone, subtotal, discount, tax, grand_total, payment_method, status, created_at, items:bill_items(id, description, unit_price, quantity, line_total, inventory_unit:inventory_units(imei, imei2, serial), product:products(name, model, brand:brands(name)))",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as Bill[];
    },
  });

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      if (payment !== "all") {
        const pm = (b.payment_method ?? "").toLowerCase();
        if (payment === "card" ? !pm.includes("card") : pm !== payment) return false;
      }
      if (!q) return true;
      const hay: (string | null | undefined)[] = [
        b.bill_number,
        b.customer_name,
        b.customer_phone,
        b.payment_method,
        b.status,
        new Date(b.created_at).toLocaleDateString(),
      ];
      for (const it of b.items ?? []) {
        hay.push(
          it.description,
          it.inventory_unit?.imei,
          it.inventory_unit?.serial,
          it.product?.name,
          it.product?.model,
          it.product?.brand?.name,
        );
      }
      return hay.some((f) => f && f.toString().toLowerCase().includes(q));
    });
  }, [bills, q, payment]);

  function exportAll() {
    try {
      const rows: Record<string, string | number>[] = [];
      for (const b of filtered) {
        const list: (BillItem | null)[] = b.items?.length ? b.items : [null];
        for (const it of list) {
          rows.push({
            "Bill #": b.bill_number ?? "",
            "Date": new Date(b.created_at).toLocaleString(),
            "Customer": b.customer_name ?? "",
            "Phone": b.customer_phone ?? "",
            "Brand": it?.product?.brand?.name ?? "",
            "Product": it ? productLabel(it) : "",
            "IMEI": it?.inventory_unit?.imei ?? "",
            "Serial": it?.inventory_unit?.serial ?? "",
            "Unit Price": Number(it?.unit_price ?? 0),
            "Qty": Number(it?.quantity ?? 0),
            "Line Total": Number(it?.line_total ?? 0),
            "Subtotal": Number(b.subtotal ?? 0),
            "Discount": Number(b.discount ?? 0),
            "Tax": Number(b.tax ?? 0),
            "Grand Total": Number(b.grand_total ?? 0),
            "Payment": b.payment_method ?? "",
            "Status": b.status ?? "",
          });
        }
      }
      exportToXLSX(rows, "Bills", "used-mobiles-bills");
      toast.success(`Exported ${rows.length} rows`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const paymentChips: { id: PaymentFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "cash", label: "Cash" },
    { id: "upi", label: "UPI" },
    { id: "card", label: "Card" },
    { id: "other", label: "Other" },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Bills</h1>
          <p className="text-sm text-admin-muted">
            {filtered.length} of {bills.length} bills{q ? " (filtered)" : ""}
          </p>
        </div>
        <button
          onClick={exportAll}
          disabled={!filtered.length}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-admin-border bg-admin-surface px-4 text-sm font-semibold text-admin-text hover:border-amber/40 disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export XLSX
        </button>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bill #, IMEI, serial, product, brand, customer, phone…"
          className="h-11 w-full rounded-md border border-admin-border bg-admin-surface pl-10 pr-10 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-amber/60"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-admin-muted hover:text-admin-text">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {paymentChips.map((c) => (
          <button
            key={c.id}
            onClick={() => setPayment(c.id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              payment === c.id
                ? "border-amber bg-amber/15 text-amber"
                : "border-admin-border bg-admin-surface text-admin-muted hover:text-admin-text"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-admin-border bg-admin-surface">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted">
            <tr>
              <th className="px-4 py-3">Bill #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">IMEI</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Pay</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-admin-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-admin-muted">No bills found.</td></tr>
            ) : (
              filtered.map((b) => {
                const firstItem = b.items?.[0];
                const extra = (b.items?.length ?? 0) - 1;
                const product = firstItem ? productLabel(firstItem) : "—";
                const imei = firstItem?.inventory_unit?.imei ?? "—";
                return (
                  <tr key={b.id} className={`hover:bg-admin-surface-2/50 ${selected === b.id ? "bg-admin-surface-2" : ""}`}>
                    <td onClick={() => setSelected(b.id === selected ? null : b.id)} className="cursor-pointer px-4 py-3 font-mono text-xs">{b.bill_number}</td>
                    <td onClick={() => setSelected(b.id === selected ? null : b.id)} className="cursor-pointer px-4 py-3">
                      {b.customer_name ?? "—"}
                      <div className="text-xs text-admin-muted">{b.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="truncate max-w-[220px]">{product}</div>
                      {extra > 0 && <div className="text-xs text-admin-muted">+{extra} more</div>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{imei}</td>
                    <td className="px-4 py-3 text-admin-muted">{new Date(b.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="rounded bg-admin-surface-2 px-2 py-1 text-xs">{b.payment_method ?? "—"}</span></td>
                    <td className="px-4 py-3 text-right font-num font-bold text-amber">{formatINR(b.grand_total)}</td>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selected && (() => {
        const b = bills.find((x) => x.id === selected);
        if (!b) return null;
        return (
          <div className="rounded-xl border border-admin-border bg-admin-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-bold">Bill {b.bill_number} — items</h3>
              <button onClick={() => setSelected(null)} className="text-xs text-admin-muted hover:text-admin-text">Close</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-admin-muted">
                  <tr>
                    <th className="px-2 py-2">Product</th>
                    <th className="px-2 py-2">IMEI</th>
                    <th className="px-2 py-2">Serial</th>
                    <th className="px-2 py-2 text-right">Qty</th>
                    <th className="px-2 py-2 text-right">Unit ₹</th>
                    <th className="px-2 py-2 text-right">Total ₹</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {b.items.map((it) => (
                    <tr key={it.id}>
                      <td className="px-2 py-2">{productLabel(it)}</td>
                      <td className="px-2 py-2 font-mono text-xs">{it.inventory_unit?.imei ?? "—"}</td>
                      <td className="px-2 py-2 font-mono text-xs">{it.inventory_unit?.serial ?? "—"}</td>
                      <td className="px-2 py-2 text-right">{it.quantity}</td>
                      <td className="px-2 py-2 text-right font-num">{formatINR(it.unit_price)}</td>
                      <td className="px-2 py-2 text-right font-num font-semibold">{formatINR(it.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
