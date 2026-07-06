/**
 * Advance-payment receipt template.
 *
 * Renders a print-friendly HTML document for a CONFIRMED reservation. Kept
 * dependency-free so it works in the Worker runtime; browsers can print-to-PDF
 * via `window.print()`. If we later want a headless PDF binary, wire in a
 * WASM-compatible generator (e.g. `pdf-lib`) — the data model here is stable.
 */

export type ReservationReceiptData = {
  reservation_number: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  product_title: string;
  product_price: number;
  reservation_amount: number;
  balance_due: number;
  confirmed_at: string | null;
  reservation_expires_at: string | null;
  payment_reference?: string | null;
  shop: {
    name: string;
    tagline?: string;
    address?: string;
    phone?: string;
    email?: string;
    gstin?: string;
  };
};

function esc(input: string | number | null | undefined): string {
  if (input == null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inr(n: number): string {
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function renderReservationReceipt(data: ReservationReceiptData): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Advance Receipt — ${esc(data.reservation_number)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      color: #0f172a; background: #f8fafc; margin: 0; padding: 24px;
    }
    .sheet {
      max-width: 720px; margin: 0 auto; background: #fff;
      border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 32px; box-shadow: 0 1px 2px rgba(15,23,42,.04);
    }
    header { display: flex; justify-content: space-between; align-items: flex-start;
      padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; margin-bottom: 24px; }
    header h1 { font-size: 20px; margin: 0; letter-spacing: .02em; }
    header .tag { font-size: 12px; color: #64748b; margin-top: 4px; }
    header .meta { text-align: right; font-size: 12px; color: #475569; line-height: 1.6; }
    header .meta strong { color: #0f172a; }
    h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .08em;
      color: #64748b; margin: 24px 0 8px; font-weight: 600; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; }
    .row { font-size: 14px; }
    .row .k { color: #64748b; font-size: 12px; }
    .row .v { font-weight: 500; }
    .amounts { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-top: 16px; }
    .amounts .line { display: flex; justify-content: space-between; padding: 12px 16px; font-size: 14px; }
    .amounts .line + .line { border-top: 1px solid #f1f5f9; }
    .amounts .paid { background: #ecfdf5; color: #065f46; font-weight: 600; }
    .amounts .due { background: #f8fafc; }
    .note { margin-top: 24px; padding: 12px 16px; background: #fef3c7; color: #78350f;
      border-radius: 8px; font-size: 12px; line-height: 1.5; }
    footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;
      font-size: 11px; color: #64748b; text-align: center; line-height: 1.6; }
    .status-badge { display: inline-block; padding: 2px 10px; border-radius: 999px;
      font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
      background: #dcfce7; color: #166534; }
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { border: none; box-shadow: none; border-radius: 0; padding: 24px; }
      .print-hide { display: none !important; }
    }
    .actions { text-align: center; margin-top: 16px; }
    .actions button { background: #0f172a; color: #fff; border: 0; padding: 10px 18px;
      border-radius: 8px; font-size: 14px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="sheet">
    <header>
      <div>
        <h1>${esc(data.shop.name)}</h1>
        ${data.shop.tagline ? `<div class="tag">${esc(data.shop.tagline)}</div>` : ""}
      </div>
      <div class="meta">
        <div><strong>ADVANCE RECEIPT</strong></div>
        <div>${esc(data.reservation_number)}</div>
        <div>${fmtDate(data.confirmed_at)}</div>
        <div style="margin-top:6px"><span class="status-badge">${esc(data.status)}</span></div>
      </div>
    </header>

    <h2>Customer</h2>
    <div class="grid">
      <div class="row"><div class="k">Name</div><div class="v">${esc(data.customer_name)}</div></div>
      <div class="row"><div class="k">Phone</div><div class="v">${esc(data.customer_phone)}</div></div>
      ${data.customer_email ? `<div class="row"><div class="k">Email</div><div class="v">${esc(data.customer_email)}</div></div>` : ""}
      ${data.payment_reference ? `<div class="row"><div class="k">Payment Ref</div><div class="v">${esc(data.payment_reference)}</div></div>` : ""}
    </div>

    <h2>Item Reserved</h2>
    <div class="row"><div class="v" style="font-size:15px">${esc(data.product_title)}</div></div>

    <div class="amounts">
      <div class="line"><span>Product Price</span><span>${inr(data.product_price)}</span></div>
      <div class="line paid"><span>Advance Paid</span><span>${inr(data.reservation_amount)}</span></div>
      <div class="line due"><span>Balance Due at Pickup</span><span><strong>${inr(data.balance_due)}</strong></span></div>
    </div>

    <div class="note">
      <strong>Reservation valid until ${fmtDate(data.reservation_expires_at)}.</strong><br />
      Refund policy: 50% of the advance is refundable if cancelled within 24 hours of payment. After 24 hours the advance is non-refundable. Reservations that are not picked up within 7 days are cancelled and the advance is forfeited.
    </div>

    <footer>
      ${data.shop.address ? esc(data.shop.address) + " · " : ""}
      ${data.shop.phone ? "☎ " + esc(data.shop.phone) + " · " : ""}
      ${data.shop.email ? esc(data.shop.email) : ""}
      ${data.shop.gstin ? "<br />GSTIN: " + esc(data.shop.gstin) : ""}
    </footer>

    <div class="actions print-hide">
      <button type="button" onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>
</body>
</html>`;
}
