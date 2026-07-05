import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft, Phone, MapPin, MessageCircle, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  formatINR,
  SHOP_ADDRESS,
  SHOP_PHONE,
  SHOP_WHATSAPP_DISPLAY,
  SHOP_INSTAGRAM_HANDLE,
} from "@/lib/shop";

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
  const auto = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get(
    "print",
  );

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
  if (error)
    return <div className="p-10 text-center text-sm text-red-600">{(error as Error).message}</div>;
  if (!data) return null;

  const { bill, items } = data;
  const created = new Date(bill.created_at);
  const totalQty = items.reduce((s, it) => s + Number(it.quantity || 0), 0);

  return (
    <div className="print-root min-h-screen bg-neutral-100 text-neutral-900 print:bg-white">
      {/* Toolbar (hidden on print) */}
      <div className="no-print sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[210mm] items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/admin/bills"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" /> Bills
          </Link>
          <div className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Invoice ·{" "}
            <span className="font-mono normal-case tracking-normal text-neutral-800">
              {bill.bill_number}
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-neutral-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* A4 invoice sheet */}
      <div className="mx-auto my-6 print:my-0">
        <div className="invoice-sheet mx-auto flex flex-col bg-white text-neutral-900 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)] ring-1 ring-neutral-200/70 print:shadow-none print:ring-0">
          {/* Accent top rule */}
          <div className="h-1.5 w-full bg-[var(--amber)]" />

          <div className="flex flex-1 flex-col px-12 pt-10 pb-8">
            {/* Header */}
            <header className="flex items-start justify-between gap-8">
              <div className="flex items-center gap-3">
                <img
                  src="/USED_MOBILE_LOGO.png"
                  alt="USED MOBILES"
                  className="h-14 w-14 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <div
                    className="text-xl font-extrabold leading-none tracking-tight text-neutral-900"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    USED MOBILES
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                    BUY · SELL · TRUST
                  </div>
                  <div className="mt-2 text-[11px] leading-snug text-neutral-500 max-w-[280px]">
                    Hyder Manzil, 7 Tombs Rd, Toli Chowki,
                    <br />
                    Hyderabad, Telangana 500008
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className="text-[32px] font-bold leading-none tracking-tight text-neutral-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  INVOICE
                </div>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {bill.status?.toUpperCase() || "PAID"}
                  </span>
                </div>
                <div className="mt-3 space-y-0.5 text-[11px] text-neutral-600">
                  <div className="font-mono">
                    <span className="text-neutral-400">No. </span>
                    <span className="font-semibold text-neutral-900">{bill.bill_number}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Date </span>
                    <span className="font-semibold text-neutral-900">
                      {created.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Divider */}
            <div className="mt-8 h-px w-full bg-neutral-200" />

            {/* Bill To + Payment */}
            <section className="mt-6 grid grid-cols-2 gap-8">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--amber-dark)]">
                  Billed To
                </div>
                <div className="mt-2 text-sm font-semibold text-neutral-900">
                  {bill.customer_name || "Walk-in Customer"}
                </div>
                {bill.customer_phone && (
                  <div className="mt-0.5 font-mono text-xs text-neutral-600">
                    {bill.customer_phone}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--amber-dark)]">
                  Payment Method
                </div>
                <div className="mt-2 text-sm font-semibold capitalize text-neutral-900">
                  {bill.payment_method || "Cash"}
                </div>
                <div className="mt-0.5 text-xs text-neutral-600">
                  {created.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                  {items.length} item{items.length === 1 ? "" : "s"} · Qty {totalQty}
                </div>
              </div>
            </section>

            {/* Items table */}
            <section className="mt-6">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="border-y-2 border-neutral-900 text-neutral-900">
                    <th className="w-8 py-2.5 pl-1 text-left text-[10px] font-bold uppercase tracking-wider">
                      #
                    </th>
                    <th className="py-2.5 text-left text-[10px] font-bold uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-2.5 text-left text-[10px] font-bold uppercase tracking-wider">
                      IMEI
                    </th>
                    <th className="w-12 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="w-24 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="w-28 py-2.5 pr-1 text-right text-[10px] font-bold uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const productName = it.product
                      ? `${it.product.brand?.name ?? ""} ${it.product.name}`.trim()
                      : (it.description ?? "—");
                    return (
                      <tr key={it.id} className="border-b border-neutral-100 align-top">
                        <td className="py-3 pl-1 text-neutral-400">{i + 1}</td>
                        <td className="py-3 pr-3 font-medium text-neutral-900">{productName}</td>
                        <td className="py-3 pr-3 font-mono text-[11px] text-neutral-600">
                          {it.inventory_unit?.imei || "—"}
                          {it.inventory_unit?.imei2 && (
                            <div className="text-[10px] text-neutral-400">
                              {it.inventory_unit.imei2}
                            </div>
                          )}
                        </td>
                        <td className="py-3 text-center text-neutral-900">{it.quantity}</td>
                        <td className="py-3 text-right font-num text-neutral-900">
                          {formatINR(it.unit_price)}
                        </td>
                        <td className="py-3 pr-1 text-right font-num font-semibold text-neutral-900">
                          {formatINR(it.line_total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            {/* Totals */}
            <section className="mt-6 flex justify-end">
              <dl className="w-full max-w-[280px] space-y-1.5 text-[12px]">
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
                <div className="!mt-3 flex items-center justify-between rounded-md bg-neutral-900 px-4 py-3 text-white">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.2em]">Total</dt>
                  <dd className="font-num text-lg font-extrabold text-[var(--amber)]">
                    {formatINR(bill.grand_total)}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Spacer that grows to push footer down */}
            <div className="flex-1 min-h-6" />

            {/* Thank-you + Signature */}
            <section className="mt-10 grid grid-cols-2 gap-8">
              <div className="flex flex-col justify-end">
                <div
                  className="text-lg font-bold tracking-tight text-neutral-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Thank you for your purchase.
                </div>
                <p className="mt-1.5 max-w-[300px] text-[11px] leading-relaxed text-neutral-600">
                  We appreciate your trust in{" "}
                  <span className="font-semibold text-neutral-900">Used Mobiles</span>. Every device
                  is quality-checked and covered under our shop warranty. For any support, please
                  reach out to the store.
                </p>
              </div>
              <div className="flex flex-col items-end justify-end text-right">
                <div className="w-56 border-t border-neutral-400 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                  Authorised Signatory
                </div>
                <div className="mt-1 text-[11px] font-semibold text-neutral-900">
                  for Used Mobiles
                </div>
              </div>
            </section>

            {/* Footer contact strip */}
            <footer className="mt-8 border-t border-neutral-200 pt-4">
              <div className="grid grid-cols-4 gap-3 text-[10px] text-neutral-600">
                <div className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[var(--amber-dark)]" />
                  <span className="leading-snug">{SHOP_ADDRESS}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Phone className="mt-0.5 h-3 w-3 shrink-0 text-[var(--amber-dark)]" />
                  <span>{SHOP_PHONE}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MessageCircle className="mt-0.5 h-3 w-3 shrink-0 text-[var(--amber-dark)]" />
                  <span>WhatsApp {SHOP_WHATSAPP_DISPLAY}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Instagram className="mt-0.5 h-3 w-3 shrink-0 text-[var(--amber-dark)]" />
                  <span>{SHOP_INSTAGRAM_HANDLE}</span>
                </div>
              </div>
              <div className="mt-3 text-center text-[9px] uppercase tracking-[0.28em] text-neutral-400">
                Computer-generated invoice · No signature required
              </div>
            </footer>
          </div>
        </div>
      </div>

      <style>{`
        .invoice-sheet {
          width: 210mm;
          min-height: 297mm;
        }
        @media screen and (max-width: 900px) {
          .invoice-sheet {
            width: 100%;
            min-height: 0;
          }
        }

        /* ── Print stylesheet ─────────────────────────────── */
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Hide any non-print UI (toolbar, dev overlays, toasts, sidebars) */
          .no-print,
          [data-no-print],
          nav[role="navigation"],
          [role="toolbar"] {
            display: none !important;
          }

          /* Neutralise on-screen wrappers so the sheet is the page */
          .print-root,
          .print-root > * {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
            max-width: none !important;
            width: 100% !important;
            box-shadow: none !important;
          }

          .invoice-sheet {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;   /* center on page */
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;  /* no accidental horizontal scroll */
            page-break-after: avoid;
          }

          /* Force color fidelity for accent bars, dark totals, badges */
          .invoice-sheet,
          .invoice-sheet * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Keep structural blocks from being split across pages */
          .invoice-sheet header,
          .invoice-sheet section,
          .invoice-sheet footer,
          .invoice-sheet table thead,
          .invoice-sheet table tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Firefox: prevent tables from stretching outside the page box */
          .invoice-sheet table {
            width: 100% !important;
            table-layout: auto;
          }

          /* Images (logo) must not overflow */
          .invoice-sheet img {
            max-width: 100% !important;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
}
