import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  Search,
  X,
  Eye,
  Printer,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  Calendar,
  Phone,
  User,
  Package,
  ArrowRight,
  AlertTriangle,
  BookmarkCheck,
  RotateCcw,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";
import {
  cancelReservation,
  convertReservationToSale,
  getRefundEligibility,
} from "@/lib/reservations.functions";

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  head: () => ({ meta: [{ title: "Reservations · Admin" }] }),
  component: ReservationsPage,
});

type Reservation = {
  id: string;
  reservation_number: string | null;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  product_id: string;
  inventory_unit_id: string;
  product_price: number;
  reservation_amount: number;
  balance_due: number;
  refund_amount: number;
  refund_id: string | null;
  refund_reason: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  public_token: string;
  hold_expires_at: string;
  reservation_expires_at: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  converted_at: string | null;
  converted_bill_id: string | null;
  created_at: string;
  product?: { name: string | null; brand: { name: string | null } | null } | null;
  inventory_unit?: { imei: string | null; imei2: string | null; serial: string | null } | null;
};

type FilterKey =
  | "all"
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "EXPIRED"
  | "CANCELLED"
  | "REFUNDED_PARTIAL"
  | "CONVERTED"
  | "EXPIRING_SOON"
  | "TODAY";

const STATUS_META: Record<
  string,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  PENDING_PAYMENT: { label: "Pending Payment", className: "bg-amber/15 text-amber border-amber/30", icon: Clock },
  CONFIRMED: { label: "Reserved", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  EXPIRED: { label: "Expired", className: "bg-admin-muted/15 text-admin-muted border-admin-border", icon: Clock },
  CANCELLED: { label: "Cancelled", className: "bg-ruby/15 text-ruby border-ruby/30", icon: XCircle },
  REFUNDED_PARTIAL: { label: "Refunded", className: "bg-sky-500/15 text-sky-400 border-sky-500/30", icon: RotateCcw },
  CONFIRMED_ORPHANED: { label: "Orphaned", className: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30", icon: AlertTriangle },
  CONVERTED: { label: "Converted", className: "bg-violet-500/15 text-violet-400 border-violet-500/30", icon: ArrowRight },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, className: "bg-admin-surface-2 text-admin-muted border-admin-border", icon: Clock };
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${m.className}`}>
      <Icon className="h-3 w-3" /> {m.label}
    </span>
  );
}

function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ReservationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(
          "id, reservation_number, status, customer_name, customer_phone, customer_email, product_id, inventory_unit_id, product_price, reservation_amount, balance_due, refund_amount, refund_id, refund_reason, razorpay_order_id, razorpay_payment_id, public_token, hold_expires_at, reservation_expires_at, confirmed_at, cancelled_at, converted_at, converted_bill_id, created_at, product:products(name, brand:brands(name)), inventory_unit:inventory_units(imei, imei2, serial)",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as Reservation[];
    },
  });

  const kpis = useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const in24h = now + 24 * 3600_000;
    const k = {
      active: 0,
      pending: 0,
      today: 0,
      expiringToday: 0,
      expired: 0,
      converted: 0,
      refunded: 0,
      cancelled: 0,
    };
    for (const r of rows) {
      const created = new Date(r.created_at).getTime();
      if (created >= startOfToday.getTime()) k.today++;
      if (r.status === "CONFIRMED") k.active++;
      if (r.status === "PENDING_PAYMENT") k.pending++;
      if (r.status === "EXPIRED") k.expired++;
      if (r.status === "CONVERTED") k.converted++;
      if (r.status === "REFUNDED_PARTIAL") k.refunded++;
      if (r.status === "CANCELLED") k.cancelled++;
      const exp = r.reservation_expires_at ? new Date(r.reservation_expires_at).getTime() : 0;
      if (r.status === "CONFIRMED" && exp > now && exp <= in24h) k.expiringToday++;
    }
    return k;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const in24h = now + 24 * 3600_000;
    return rows.filter((r) => {
      // Filter chip
      if (filter === "EXPIRING_SOON") {
        const exp = r.reservation_expires_at ? new Date(r.reservation_expires_at).getTime() : 0;
        if (!(r.status === "CONFIRMED" && exp > now && exp <= in24h)) return false;
      } else if (filter === "TODAY") {
        if (new Date(r.created_at).getTime() < startOfToday.getTime()) return false;
      } else if (filter !== "all") {
        if (r.status !== filter) return false;
      }
      if (!q) return true;
      const pn = `${r.product?.brand?.name ?? ""} ${r.product?.name ?? ""}`.toLowerCase();
      const imei = `${r.inventory_unit?.imei ?? ""} ${r.inventory_unit?.imei2 ?? ""} ${r.inventory_unit?.serial ?? ""}`.toLowerCase();
      return [r.reservation_number, r.customer_name, r.customer_phone, r.status, pn, imei]
        .some((v) => (v ?? "").toString().toLowerCase().includes(q));
    });
  }, [rows, filter, search]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <BookmarkCheck className="h-6 w-6 text-amber" />
          <h1 className="font-display text-2xl font-bold tracking-tight">Reservations</h1>
        </div>
        <p className="mt-1 text-sm text-admin-muted">Manage advance-paid holds and convert them into sales.</p>
      </header>

      {/* KPI Grid */}
      <section className="grid gap-3 grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Reserved" value={kpis.active} accent="emerald" />
        <Kpi label="Pending Payment" value={kpis.pending} accent="amber" />
        <Kpi label="Today" value={kpis.today} accent="sky" />
        <Kpi label="Expiring ≤24h" value={kpis.expiringToday} accent="ruby" />
        <Kpi label="Expired" value={kpis.expired} accent="muted" />
        <Kpi label="Converted" value={kpis.converted} accent="violet" />
        <Kpi label="Refunded" value={kpis.refunded} accent="sky" />
        <Kpi label="Cancelled" value={kpis.cancelled} accent="ruby" />
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
        <FilterChip active={filter === "PENDING_PAYMENT"} onClick={() => setFilter("PENDING_PAYMENT")}>Pending</FilterChip>
        <FilterChip active={filter === "CONFIRMED"} onClick={() => setFilter("CONFIRMED")}>Reserved</FilterChip>
        <FilterChip active={filter === "EXPIRING_SOON"} onClick={() => setFilter("EXPIRING_SOON")}>Expiring soon</FilterChip>
        <FilterChip active={filter === "TODAY"} onClick={() => setFilter("TODAY")}>Today</FilterChip>
        <FilterChip active={filter === "EXPIRED"} onClick={() => setFilter("EXPIRED")}>Expired</FilterChip>
        <FilterChip active={filter === "CONVERTED"} onClick={() => setFilter("CONVERTED")}>Converted</FilterChip>
        <FilterChip active={filter === "CANCELLED"} onClick={() => setFilter("CANCELLED")}>Cancelled</FilterChip>
        <FilterChip active={filter === "REFUNDED_PARTIAL"} onClick={() => setFilter("REFUNDED_PARTIAL")}>Refunded</FilterChip>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-md border border-admin-border bg-admin-surface px-3">
        <Search className="h-4 w-4 text-admin-muted" />
        <input
          placeholder="Search by number, name, phone, product or IMEI…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 flex-1 bg-transparent outline-none text-sm"
          aria-label="Search reservations"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-admin-muted hover:text-admin-text" aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-admin-border bg-admin-surface">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-admin-surface-2 text-[11px] uppercase tracking-wider text-admin-muted">
            <tr>
              <th className="px-3 py-2 text-left">Reservation</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-right">Advance</th>
              <th className="px-3 py-2 text-right">Balance</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Expires</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={9} className="py-10 text-center text-admin-muted">Loading…</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={9} className="py-10 text-center text-admin-muted">No reservations match.</td></tr>
            )}
            {filtered.map((r) => {
              const expiry = r.status === "PENDING_PAYMENT" ? r.hold_expires_at : r.reservation_expires_at;
              return (
                <tr
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className="cursor-pointer border-t border-admin-border transition hover:bg-admin-surface-2"
                >
                  <td className="px-3 py-2 font-mono text-xs">{r.reservation_number ?? r.id.slice(0, 8)}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold truncate max-w-[180px]">{r.customer_name}</div>
                    <div className="text-[11px] text-admin-muted">{r.customer_phone}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="truncate max-w-[220px]">
                      <span className="text-admin-muted">{r.product?.brand?.name ?? ""}</span>{" "}
                      <span className="font-semibold">{r.product?.name ?? "—"}</span>
                    </div>
                    <div className="font-mono text-[10px] text-admin-muted truncate max-w-[220px]">
                      {r.inventory_unit?.imei ?? "no IMEI"}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-num">{formatINR(r.reservation_amount)}</td>
                  <td className="px-3 py-2 text-right font-num text-admin-muted">{formatINR(r.balance_due)}</td>
                  <td className="px-3 py-2 text-[11px] text-admin-muted">{fmtDate(r.created_at)}</td>
                  <td className="px-3 py-2 text-[11px] text-admin-muted">{fmtDate(expiry)}</td>
                  <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedId(r.id); }}
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-admin-border bg-admin-surface px-2 text-xs text-admin-muted hover:border-amber/40 hover:text-admin-text"
                      aria-label="View reservation"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <ReservationDrawer reservation={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number; accent: "emerald" | "amber" | "sky" | "ruby" | "muted" | "violet" }) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-400",
    amber: "text-amber",
    sky: "text-sky-400",
    ruby: "text-ruby",
    muted: "text-admin-muted",
    violet: "text-violet-400",
  };
  return (
    <div className="rounded-lg border border-admin-border bg-admin-surface p-3">
      <div className="text-[10px] uppercase tracking-wider text-admin-muted">{label}</div>
      <div className={`font-num text-2xl font-bold ${colors[accent]}`}>{value}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-8 rounded-full border px-3 text-xs font-semibold transition ${
        active
          ? "border-amber bg-amber text-ink"
          : "border-admin-border bg-admin-surface text-admin-muted hover:border-amber/40 hover:text-admin-text"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Drawer ------------------------------ */

type ReservationEvent = {
  id: string;
  event_type: string;
  prev_status: string | null;
  new_status: string | null;
  actor: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

function ReservationDrawer({ reservation, onClose }: { reservation: Reservation; onClose: () => void }) {
  const qc = useQueryClient();
  const [showCancel, setShowCancel] = useState(false);
  const [showConvert, setShowConvert] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ["admin", "reservation-detail", reservation.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservation_events")
        .select("*")
        .eq("reservation_id", reservation.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as ReservationEvent[];
    },
  });

  const eligibilityFn = useServerFn(getRefundEligibility);
  const { data: eligibility } = useQuery({
    queryKey: ["admin", "reservation-eligibility", reservation.id],
    queryFn: () => eligibilityFn({ data: { reservation_id: reservation.id } }),
    enabled: reservation.status === "CONFIRMED" || reservation.status === "PENDING_PAYMENT",
  });

  const canCancel = ["PENDING_PAYMENT", "CONFIRMED", "CONFIRMED_ORPHANED"].includes(reservation.status);
  const canConvert = reservation.status === "CONFIRMED";
  const canPrintReceipt = ["CONFIRMED", "CONVERTED", "REFUNDED_PARTIAL", "CANCELLED"].includes(reservation.status);
  const receiptUrl = `/reservation/${reservation.public_token}`;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-label="Reservation details"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-admin-border bg-admin-bg shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-admin-border p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold">{reservation.reservation_number ?? reservation.id.slice(0, 8)}</span>
              <StatusBadge status={reservation.status} />
            </div>
            <div className="mt-1 text-xs text-admin-muted">Created {fmtDate(reservation.created_at)}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Customer + Product */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard title="Customer" icon={User}>
              <Row label="Name" value={reservation.customer_name} />
              <Row label="Phone" value={reservation.customer_phone} icon={Phone} />
              {reservation.customer_email && <Row label="Email" value={reservation.customer_email} />}
            </InfoCard>
            <InfoCard title="Product" icon={Package}>
              <Row label="Item" value={`${reservation.product?.brand?.name ?? ""} ${reservation.product?.name ?? ""}`.trim() || "—"} />
              <Row label="IMEI" value={reservation.inventory_unit?.imei ?? "—"} mono />
              {reservation.inventory_unit?.imei2 && <Row label="IMEI 2" value={reservation.inventory_unit.imei2} mono />}
            </InfoCard>
          </div>

          {/* Amounts */}
          <InfoCard title="Payment" icon={IndianRupee}>
            <Row label="Product Price" value={formatINR(reservation.product_price)} num />
            <Row label="Advance Paid" value={formatINR(reservation.reservation_amount)} num accent="emerald" />
            <Row label="Balance Due" value={formatINR(reservation.balance_due)} num accent="amber" />
            {reservation.refund_amount > 0 && (
              <Row label="Refunded" value={formatINR(reservation.refund_amount)} num accent="sky" />
            )}
            {reservation.razorpay_payment_id && (
              <Row label="Payment Ref" value={reservation.razorpay_payment_id} mono />
            )}
            {reservation.refund_id && <Row label="Refund Ref" value={reservation.refund_id} mono />}
          </InfoCard>

          {/* Dates */}
          <InfoCard title="Timeline" icon={Calendar}>
            <Row label="Created" value={fmtDate(reservation.created_at)} />
            {reservation.confirmed_at && <Row label="Confirmed" value={fmtDate(reservation.confirmed_at)} />}
            {reservation.status === "PENDING_PAYMENT" && <Row label="Hold Expires" value={fmtDate(reservation.hold_expires_at)} accent="amber" />}
            {reservation.reservation_expires_at && <Row label="Reservation Expires" value={fmtDate(reservation.reservation_expires_at)} accent="amber" />}
            {reservation.converted_at && <Row label="Converted" value={fmtDate(reservation.converted_at)} accent="emerald" />}
            {reservation.cancelled_at && <Row label="Cancelled" value={fmtDate(reservation.cancelled_at)} accent="ruby" />}
          </InfoCard>

          {/* Audit timeline */}
          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-admin-muted">Audit Log</div>
            <ol className="relative ml-3 space-y-3 border-l border-admin-border pl-4">
              {events.map((ev) => (
                <li key={ev.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-amber ring-4 ring-admin-bg" />
                  <div className="text-xs font-semibold">{ev.event_type.replaceAll("_", " ")}</div>
                  <div className="text-[11px] text-admin-muted">
                    {fmtDate(ev.created_at)} · {ev.actor ?? "system"}
                    {ev.prev_status && ev.new_status && (
                      <span> · {ev.prev_status} → {ev.new_status}</span>
                    )}
                  </div>
                  {ev.payload && Object.keys(ev.payload).length > 0 && (
                    <pre className="mt-1 max-w-full overflow-x-auto rounded-md bg-admin-surface-2 p-2 text-[10px] text-admin-muted">
                      {JSON.stringify(ev.payload, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
              {events.length === 0 && <li className="text-xs text-admin-muted">No events recorded.</li>}
            </ol>
          </div>

          {eligibility && (reservation.status === "CONFIRMED" || reservation.status === "PENDING_PAYMENT") && (
            <div className={`rounded-md border p-3 text-xs ${eligibility.eligible ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-admin-border bg-admin-surface text-admin-muted"}`}>
              <div className="font-semibold">Refund eligibility</div>
              <div>
                {eligibility.eligible
                  ? `Eligible — ${eligibility.percent}% refund (${formatINR(Number(eligibility.amount))}).`
                  : `Not eligible for automatic refund (${eligibility.reason ?? "—"}).`}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <footer className="flex flex-wrap items-center gap-2 border-t border-admin-border p-3">
          {canPrintReceipt && (
            <>
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface px-3 text-xs font-medium text-admin-muted hover:text-admin-text"
              >
                <Printer className="h-3.5 w-3.5" /> Print Receipt
              </a>
              <a
                href={receiptUrl}
                download
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface px-3 text-xs font-medium text-admin-muted hover:text-admin-text"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
            </>
          )}
          {canConvert && (
            <button
              onClick={() => setShowConvert(true)}
              className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md bg-amber px-3 text-xs font-bold text-ink hover:bg-amber-dark"
            >
              <ArrowRight className="h-3.5 w-3.5" /> Convert to Sale
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancel(true)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-md border border-ruby/40 bg-ruby/10 px-3 text-xs font-bold text-ruby hover:bg-ruby/20 ${canConvert ? "" : "ml-auto"}`}
            >
              <XCircle className="h-3.5 w-3.5" /> Cancel
            </button>
          )}
        </footer>
      </aside>

      {showCancel && (
        <CancelDialog
          reservation={reservation}
          eligibility={eligibility}
          onClose={() => setShowCancel(false)}
          onDone={() => {
            setShowCancel(false);
            qc.invalidateQueries({ queryKey: ["admin", "reservations"] });
            qc.invalidateQueries({ queryKey: ["admin", "reservation-detail", reservation.id] });
            onClose();
          }}
        />
      )}
      {showConvert && (
        <ConvertDialog
          reservation={reservation}
          onClose={() => setShowConvert(false)}
          onDone={(billId) => {
            setShowConvert(false);
            qc.invalidateQueries({ queryKey: ["admin", "reservations"] });
            qc.invalidateQueries({ queryKey: ["admin", "bills"] });
            toast.success("Reservation converted to sale");
            try { window.open(`/receipt/${billId}`, "_blank", "noopener"); } catch { /* noop */ }
            onClose();
          }}
        />
      )}
    </>
  );
}

function InfoCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-admin-border bg-admin-surface p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-admin-muted">
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value, icon: Icon, num, mono, accent }: { label: string; value: string; icon?: React.ComponentType<{ className?: string }>; num?: boolean; mono?: boolean; accent?: "emerald" | "amber" | "ruby" | "sky" }) {
  const colors: Record<string, string> = { emerald: "text-emerald-400", amber: "text-amber", ruby: "text-ruby", sky: "text-sky-400" };
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 text-xs text-admin-muted">{Icon && <Icon className="h-3 w-3" />}{label}</div>
      <div className={`text-right ${num ? "font-num font-semibold" : ""} ${mono ? "font-mono text-xs" : ""} ${accent ? colors[accent] : ""} truncate max-w-[60%]`}>{value}</div>
    </div>
  );
}

/* ------------------------------ Cancel dialog ------------------------------ */

function CancelDialog({
  reservation,
  eligibility,
  onClose,
  onDone,
}: {
  reservation: Reservation;
  eligibility: { eligible: boolean; percent: number; amount: number; reason: string } | undefined;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const cancelFn = useServerFn(cancelReservation);
  const cancel = useMutation({
    mutationFn: (payload: { reservation_id: string; reason: string; force_full_refund?: boolean }) =>
      cancelFn({ data: payload }),
    onSuccess: onDone,
    onError: (e: Error) => toast.error(e.message || "Could not cancel reservation"),
  });

  const eligibleAmount = eligibility?.eligible ? Number(eligibility.amount) : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-admin-border bg-admin-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-ruby" />
          <h3 className="font-display text-lg font-bold">Cancel Reservation</h3>
        </div>
        <p className="mb-3 text-sm text-admin-muted">
          Cancelling {reservation.reservation_number} for <span className="text-admin-text">{reservation.customer_name}</span>.
        </p>
        <div className="mb-3 rounded-md border border-admin-border bg-admin-surface-2 p-3 text-xs">
          {eligibility?.eligible ? (
            <div className="text-emerald-400">
              Refund available: {eligibility.percent}% ({formatINR(eligibleAmount)}) will be refunded via the original payment method.
            </div>
          ) : (
            <div className="text-admin-muted">
              Not eligible for automatic refund ({eligibility?.reason ?? "—"}). Cancelling will release the phone back to stock without a refund.
            </div>
          )}
        </div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted" htmlFor="cancel-reason">
          Reason (internal note)
        </label>
        <textarea
          id="cancel-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="e.g. Customer no-show, product defect…"
          className="admin-input w-full text-sm"
        />
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-9 rounded-md border border-admin-border bg-admin-surface px-3 text-xs">
            Back
          </button>
          <button
            onClick={() => {
              if (reason.trim().length < 3) return toast.error("Please enter a reason.");
              cancel.mutate({ reservation_id: reservation.id, reason: reason.trim() });
            }}
            disabled={cancel.isPending}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ruby px-3 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {cancel.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Convert dialog ------------------------------ */

function ConvertDialog({
  reservation,
  onClose,
  onDone,
}: {
  reservation: Reservation;
  onClose: () => void;
  onDone: (billId: string) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [discount, setDiscount] = useState(0);
  const convertFn = useServerFn(convertReservationToSale);
  const convert = useMutation({
    mutationFn: () =>
      convertFn({
        data: {
          reservation_id: reservation.id,
          payment_method: paymentMethod,
          discount,
          tax: 0,
        },
      }),
    onSuccess: (bill: { id: string }) => onDone(bill.id),
    onError: (e: Error) => toast.error(e.message || "Could not convert reservation"),
  });

  const balance = Math.max(0, reservation.product_price - reservation.reservation_amount - discount);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-admin-border bg-admin-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-amber" />
          <h3 className="font-display text-lg font-bold">Convert Reservation to Sale</h3>
        </div>
        <p className="mb-4 text-sm text-admin-muted">
          Customer walked in to pick up. A bill will be generated with the advance applied.
        </p>

        <div className="mb-4 space-y-1.5 rounded-md border border-admin-border bg-admin-surface-2 p-3 text-sm">
          <div className="flex justify-between text-admin-muted"><span>Product Price</span><span className="font-num">{formatINR(reservation.product_price)}</span></div>
          <div className="flex justify-between text-emerald-400"><span>Advance Paid</span><span className="font-num">− {formatINR(reservation.reservation_amount)}</span></div>
          <div className="flex justify-between text-admin-muted"><span>Discount</span><span className="font-num">− {formatINR(discount)}</span></div>
          <div className="mt-1 flex justify-between border-t border-admin-border pt-1 text-base font-bold"><span>Balance to Collect</span><span className="font-num text-amber">{formatINR(balance)}</span></div>
        </div>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Balance Payment Method</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="admin-input mb-3 w-full">
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
          <option value="OTHER">Other</option>
        </select>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Extra Discount (optional)</label>
        <input
          type="number"
          min={0}
          value={discount}
          onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
          className="admin-input w-full"
        />

        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-9 rounded-md border border-admin-border bg-admin-surface px-3 text-xs">
            Back
          </button>
          <button
            onClick={() => convert.mutate()}
            disabled={convert.isPending}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-amber px-3 text-xs font-bold text-ink hover:bg-amber-dark disabled:opacity-50"
          >
            {convert.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
