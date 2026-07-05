import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft, Phone, MapPin, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, SHOP_ADDRESS, SHOP_PHONE, SHOP_WHATSAPP_DISPLAY } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/receipt/$id")({
  head: () => ({ meta: [{ title: "Invoice · USED MOBILES" }] }),
  component: ReceiptPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Receipt not found.</div>
  ),
});

type BillRow = {
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
};
type ItemRow = {
  id: string;
  description: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  inventory_unit_id: string | null;
  product_id: string | null;
  inventory_unit: { imei: string | null; imei2: string | null } | null;
  product: { name: string; brand: { name: string } | null } | null;
};

function ReceiptPage() {
  const { id } = Route.useParams();
  const auto = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("print");

  const { data, isLoading, error } = useQuery({
    queryKey: ["receipt", id],
    queryFn: async () => {
      const { data: bill, error: e1 } = await supabase
        .from("bills")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (e1) throw e1;
      if (!bill) throw notFound();
      const { data: items, error: e2 } = await supabase
        .from("bill_items")
        .select(
          "id, description, unit_price, quantity, line_total, inventory_unit_id, product_id, inventory_unit:inventory_units(imei, imei2), product:products(name, brand:brands(name))",
        )
        .eq("bill_id", id)
        .order("created_at");
      if (e2) throw e2;
      return { bill: bill as BillRow, items: (items ?? []) as ItemRow[] };
    },
  });

  useEffect(() => {
    if (auto && data) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [auto, data]);

  if (isLoading) return <div className="p-10 text-center text-sm">Loading invoice…</div>;
  if (error) return <div className="p-10 text-center text-sm text-red-600">{(error as Error).message}</div>;
  if (!data) return null;

  const { bill, items } = data;
  const created = new Date(bill.created_at);
  const totalQty = items.reduce((s, it) => s + Number(it.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 print:bg-white">
      {/* Toolbar (hidden on print) */}
      <div className="no-print sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[880px] items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/admin/bills"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" /> Bills
          </Link>
          <div className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Invoice · <span className="font-mono normal-case tracking-normal text-neutral-800">{bill.bill_number}</span>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-neutral-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Invoice sheet */}
      <div className="mx-auto my-8 max-w-[820px] print:my-0 print:max-w-none">
        <div className="invoice-sheet rounded-xl bg-white p-10 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)] ring-1 ring-neutral-200/70 print:rounded-none print:p-10 print:shadow-none print:ring-0">
          {/* Header band */}
          <header className="flex items-start justify-between gap-8">
            <div className="flex items-center gap-3">
              <img src="/USED_MOBILE_LOGO.png" alt="USED MOBILES" className="h-12 w-12 shrink-0 object-contain" />
              <div className="min-w-0">
                <div className="font-display text-lg font-extrabold leading-tight tracking-tight text-neutral-900">
                  USED MOBILES
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                  Pre-owned Smartphones
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold tracking-tight text-neutral-900">INVOICE</div>
              <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-0.5 text-[11px] font-medium text-neutral-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {bill.status?.toUpperCase() || "PAID"}
              </div>
            </div>
          </header>

          {/* Meta grid */}
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Billed To</div>
              <div className="mt-1.5 truncate text-sm font-semibold text-neutral-900">
                {bill.customer_name || "Walk-in Customer"}
              </div>
              {bill.customer_phone && (
                <div className="mt-0.5 font-mono text-xs text-neutral-600">{bill.customer_phone}</div>
              )}
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Invoice No.</div>
              <div className="mt-1.5 font-mono text-sm font-semibold text-neutral-900">{bill.bill_number}</div>
              <div className="mt-0.5 text-xs text-neutral-600">
                {created.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                {" · "}
                {created.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Payment</div>
              <div className="mt-1.5 text-sm font-semibold capitalize text-neutral-900">
                {bill.payment_method || "—"}
              </div>
              <div className="mt-0.5 text-xs text-neutral-600">
                {items.length} item{items.length === 1 ? "" : "s"} · Qty {totalQty}
              </div>
            </div>
          </section>

          {/* Items table */}
          <section className="mt-8">
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-900 text-left text-white">
                    <th className="w-10 px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">#</th>
                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider">Description</th>
                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider">IMEI</th>
                    <th className="w-14 px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Qty</th>
                    <th className="w-28 px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">Unit Price</th>
                    <th className="w-28 px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const productName = it.product
                      ? `${it.product.brand?.name ?? ""} ${it.product.name}`.trim()
                      : it.description ?? "—";
                    return (
                      <tr key={it.id} className="border-t border-neutral-200 align-top odd:bg-white even:bg-neutral-50/50">
                        <td className="px-3 py-3 text-center text-xs text-neutral-500">{i + 1}</td>
                        <td className="px-3 py-3 font-medium text-neutral-900">{productName}</td>
                        <td className="px-3 py-3 font-mono text-xs text-neutral-600">
                          {it.inventory_unit?.imei || "—"}
                          {it.inventory_unit?.imei2 && (
                            <div className="text-[11px] text-neutral-400">{it.inventory_unit.imei2}</div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center text-neutral-900">{it.quantity}</td>
                        <td className="px-3 py-3 text-right font-num text-neutral-900">{formatINR(it.unit_price)}</td>
                        <td className="px-3 py-3 text-right font-num font-semibold text-neutral-900">
                          {formatINR(it.line_total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Notes + Totals */}
          <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-5">
            <div className="sm:col-span-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Notes</div>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
                Thank you for your purchase. All pre-owned devices are quality-checked and covered under our shop warranty policy.
                Please retain this invoice for warranty and service claims.
              </p>
            </div>

            <div className="sm:col-span-2">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Subtotal</dt>
                  <dd className="font-num text-neutral-900">{formatINR(bill.subtotal)}</dd>
                </div>
                {Number(bill.discount) > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-neutral-600">Discount</dt>
                    <dd className="font-num text-neutral-900">− {formatINR(bill.discount)}</dd>
                  </div>
                )}
                {Number(bill.tax) > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-neutral-600">Tax</dt>
                    <dd className="font-num text-neutral-900">{formatINR(bill.tax)}</dd>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between rounded-md bg-neutral-900 px-4 py-3 text-white">
                  <dt className="text-[11px] font-semibold uppercase tracking-widest">Total Due</dt>
                  <dd className="font-num text-xl font-extrabold">{formatINR(bill.grand_total)}</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-10 border-t border-neutral-200 pt-5">
            <div className="grid grid-cols-1 gap-3 text-[11px] text-neutral-600 sm:grid-cols-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <span>{SHOP_ADDRESS}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <span>{SHOP_PHONE}</span>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <span>WhatsApp {SHOP_WHATSAPP_DISPLAY}</span>
              </div>
            </div>
            <div className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              This is a computer-generated invoice
            </div>
          </footer>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .invoice-sheet { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
