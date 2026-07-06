import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { CheckCircle2, Clock, XCircle, Loader2, Receipt, Phone, MessageCircle, IndianRupee, CalendarClock } from "lucide-react";
import { SHOP_PHONE, formatINR, whatsappLink } from "@/lib/shop";

type StatusResp = {
  reservation?: {
    number: string;
    status: string;
    product_price: number;
    amount_paid: number;
    balance_due: number;
    hold_expires_at: string | null;
    reservation_expires_at: string | null;
    confirmed_at: string | null;
    cancelled_at: string | null;
    converted_at: string | null;
    customer_name: string;
  };
  error?: string;
};

export const Route = createFileRoute("/reservation-status/$token")({
  head: () => ({
    meta: [
      { title: "Reservation status — USED MOBILES" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const { token } = Route.useParams();
  const [state, setState] = useState<
    { kind: "loading" } | { kind: "error"; message: string } | { kind: "ok"; data: NonNullable<StatusResp["reservation"]> }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(`/api/public/reservations/status/${token}`);
        const j: StatusResp = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (!r.ok || !j.reservation) {
          setState({ kind: "error", message: "We couldn't find this reservation." });
          return;
        }
        setState({ kind: "ok", data: j.reservation });
      } catch {
        if (!cancelled) setState({ kind: "error", message: "Network error. Please try again." });
      }
    }
    load();
    const iv = setInterval(load, 20_000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [token]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 pt-6 md:pt-12 pb-16">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Reservation</div>
        <h1 className="mt-2 font-display text-2xl md:text-4xl font-extrabold tracking-tight">
          Your reservation
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Save this page — you can return here anytime to check the status.
        </p>

        <div className="mt-8">
          {state.kind === "loading" ? (
            <div className="rounded-2xl border border-border bg-card p-8 flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading reservation…
            </div>
          ) : state.kind === "error" ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <XCircle className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="mt-3 font-display text-lg font-bold">{state.message}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                The link may be incorrect or the reservation has expired.
              </p>
              <Link to="/catalog" className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90 transition">
                Browse catalog
              </Link>
            </div>
          ) : (
            <StatusCard data={state.data} token={token} />
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

function StatusCard({ data, token }: { data: NonNullable<StatusResp["reservation"]>; token: string }) {
  const tone = statusTone(data.status);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className={`px-5 py-4 border-b border-border flex items-center gap-3 ${tone.bar}`}>
        <div className={`grid h-9 w-9 place-items-center rounded-full ${tone.iconBg}`}>
          <tone.Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
            {data.number}
          </div>
          <div className="font-display font-bold text-foreground">{tone.title}</div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{tone.description}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <StatRow icon={<IndianRupee className="h-4 w-4" />} label="Product price" value={formatINR(data.product_price)} />
          <StatRow icon={<IndianRupee className="h-4 w-4" />} label="Advance paid" value={formatINR(data.amount_paid)} highlight />
          <StatRow icon={<IndianRupee className="h-4 w-4" />} label="Balance due (in-store)" value={formatINR(data.balance_due)} />
          {data.confirmed_at ? (
            <StatRow icon={<CalendarClock className="h-4 w-4" />} label="Confirmed" value={fmtDate(data.confirmed_at)} />
          ) : data.hold_expires_at ? (
            <StatRow icon={<Clock className="h-4 w-4" />} label="Payment window" value={fmtDate(data.hold_expires_at)} />
          ) : null}
          {data.reservation_expires_at ? (
            <StatRow icon={<CalendarClock className="h-4 w-4" />} label="Valid until" value={fmtDate(data.reservation_expires_at)} />
          ) : null}
        </div>

        {(data.status === "CONFIRMED" || data.status === "CONVERTED") ? (
          <a
            href={`/reservation/${token}`}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            <Receipt className="h-4 w-4" /> View / print receipt
          </a>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2 pt-1">
          <a
            href={`tel:${SHOP_PHONE.replace(/\s/g, "")}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold hover:border-primary transition"
          >
            <Phone className="h-4 w-4 text-primary" /> Call the shop
          </a>
          <a
            href={whatsappLink(`Hi, about my reservation ${data.number}`)}
            target="_blank"
            rel="noopener"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-whatsapp px-4 text-sm font-semibold text-white hover:bg-whatsapp-dark transition"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp us
          </a>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className={`mt-1 font-num ${highlight ? "text-primary text-lg font-extrabold" : "text-foreground font-bold"}`}>
        {value}
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function statusTone(status: string) {
  switch (status) {
    case "CONFIRMED":
      return {
        title: "Reserved · ready to collect",
        description:
          "Your advance has been received and this device is held for you. Visit the shop before the expiry date to complete your purchase.",
        Icon: CheckCircle2,
        iconBg: "bg-emerald-500/15 text-emerald-600",
        bar: "bg-emerald-500/5",
      };
    case "PENDING_PAYMENT":
      return {
        title: "Awaiting payment",
        description:
          "We're holding this device while you complete payment. If the payment window expires the hold will be released automatically.",
        Icon: Clock,
        iconBg: "bg-amber-500/15 text-amber-600",
        bar: "bg-amber-500/5",
      };
    case "CONVERTED":
      return {
        title: "Purchased",
        description: "This reservation has been converted into a completed sale. Thank you for shopping with us!",
        Icon: CheckCircle2,
        iconBg: "bg-emerald-500/15 text-emerald-600",
        bar: "bg-emerald-500/5",
      };
    case "CANCELLED":
      return {
        title: "Cancelled",
        description: "This reservation has been cancelled. If a refund is applicable it has been initiated to the original payment method.",
        Icon: XCircle,
        iconBg: "bg-muted text-muted-foreground",
        bar: "bg-muted/40",
      };
    case "EXPIRED":
      return {
        title: "Expired",
        description: "The reservation window has ended and the device has been released back into stock.",
        Icon: Clock,
        iconBg: "bg-muted text-muted-foreground",
        bar: "bg-muted/40",
      };
    default:
      return {
        title: status.replaceAll("_", " ").toLowerCase(),
        description: "Please contact us for the latest status of this reservation.",
        Icon: Clock,
        iconBg: "bg-muted text-muted-foreground",
        bar: "bg-muted/40",
      };
  }
}
