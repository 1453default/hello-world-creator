import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, SHOP_ADDRESS, SHOP_PHONE, SHOP_WHATSAPP_DISPLAY } from "@/lib/shop";
import logoAsset from "@/assets/used-mobiles-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/receipt/$id")({
  head: () => ({ meta: [{ title: "Receipt · USED MOBILES" }] }),
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
  inventory_unit: { imei: string | null } | null;
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
          "id, description, unit_price, quantity, line_total, inventory_unit_id, product_id, inventory_unit:inventory_units(imei), product:products(name, brand:brands(name))",
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

  if (isLoading) return <div className="p-10 text-center text-sm">Loading receipt…</div>;
  if (error) return <div className="p-10 text-center text-sm text-red-600">{(error as Error).message}</div>;
  if (!data) return null;

  const { bill, items } = data;
  const created = new Date(bill.created_at);

  return (
    <div className="min-h-screen bg-neutral-100 text-black print:bg-white">
      {/* Toolbar (hidden on print) */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-neutral-300 bg-white px-4 py-3 shadow-sm">
        <Link
          to="/admin/bills"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Bills
        </Link>
        <div className="text-xs text-neutral-500">Invoice {bill.bill_number}</div>
        <button
          onClick={() => window.print()}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-black px-4 text-sm font-bold text-white hover:bg-neutral-800"
        >
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      {/* Receipt sheet */}
      <div className="mx-auto my-6 max-w-[820px] bg-white p-10 shadow-md print:m-0 print:max-w-none print:p-12 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-6">
          <div className="flex items-center gap-3">
            <img src="/USED_MOBILE_LOGO.png" alt="USED MOBILES" className="h-14 w-14 object-contain" />
            <div>
              <div className="font-display text-xl font-extrabold leading-tight tracking-tight text-black">
                USED MOBILES
              </div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Pre-owned Smartphones
              </div>
            </div>
          </div>
          <h1 className="font-display text-4xl italic font-semibold text-black">Invoice</h1>
        </div>

        {/* Billed to + Invoice meta */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Billed to:</div>
            <div className="mt-1 font-semibold text-black">{bill.customer_name || "Walk-in Customer"}</div>
            {bill.customer_phone && <div className="text-sm text-neutral-700">{bill.customer_phone}</div>}
          </div>
          <div className="text-right text-sm">
            <div>
              <span className="font-bold text-black">Invoice No.</span>{" "}
              <span className="font-mono">{bill.bill_number}</span>
            </div>
            <div className="text-neutral-700">
              {created.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
            <div className="text-xs text-neutral-500">
              {created.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mt-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-black text-left">
                <th className="py-3 font-bold text-black">Item</th>
                <th className="py-3 font-bold text-black">IMEI</th>
                <th className="py-3 text-center font-bold text-black">Qty</th>
                <th className="py-3 text-right font-bold text-black">Unit Price</th>
                <th className="py-3 text-right font-bold text-black">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const productName = it.product
                  ? `${it.product.brand?.name ?? ""} ${it.product.name}`.trim()
                  : it.description ?? "—";
                return (
                  <tr key={it.id} className="border-b border-neutral-200 align-top">
                    <td className="py-3 pr-2 text-black">{productName}</td>
                    <td className="py-3 pr-2 font-mono text-xs text-neutral-700">
                      {it.inventory_unit?.imei || "—"}
                    </td>
                    <td className="py-3 text-center text-black">{it.quantity}</td>
                    <td className="py-3 text-right font-num text-black">{formatINR(it.unit_price)}</td>
                    <td className="py-3 text-right font-num font-semibold text-black">
                      {formatINR(it.line_total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-black">Subtotal</span>
              <span className="font-num text-black">{formatINR(bill.subtotal)}</span>
            </div>
            {Number(bill.discount) > 0 && (
              <div className="flex justify-between">
                <span className="font-semibold text-black">Discount</span>
                <span className="font-num text-black">− {formatINR(bill.discount)}</span>
              </div>
            )}
            {Number(bill.tax) > 0 && (
              <div className="flex justify-between">
                <span className="font-semibold text-black">Tax</span>
                <span className="font-num text-black">{formatINR(bill.tax)}</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between bg-black px-4 py-2.5 text-white">
              <span className="font-bold tracking-wide">Total</span>
              <span className="font-num text-lg font-extrabold">{formatINR(bill.grand_total)}</span>
            </div>
            {bill.payment_method && (
              <div className="pt-2 text-right text-xs text-neutral-500">
                Payment: {bill.payment_method}
              </div>
            )}
          </div>
        </div>

        {/* Thank you */}
        <div className="mt-16 font-display text-3xl italic text-black">Thank You!</div>

        {/* Footer */}
        <div className="mt-12 border-t border-neutral-200 pt-4 text-right text-xs text-neutral-700">
          <div className="font-display text-base font-bold text-black">Used Mobiles</div>
          <div>{SHOP_ADDRESS}</div>
          <div>
            Phone: {SHOP_PHONE} · WhatsApp: {SHOP_WHATSAPP_DISPLAY}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
