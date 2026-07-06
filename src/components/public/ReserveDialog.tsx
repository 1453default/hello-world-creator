import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Clock, IndianRupee, Info, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { formatINR } from "@/lib/shop";
import { Link } from "@tanstack/react-router";

type Product = {
  id: string;
  name: string;
  brand?: { name?: string | null } | null;
  storage?: string | null;
  ram?: string | null;
  color?: string | null;
  selling_price: number;
  inventory?: { id: string; status: string }[];
};

type Availability = {
  available: boolean;
  payment_configured?: boolean;
  product_price?: number;
  reservation_amount?: number;
  balance_due?: number;
  unit_status?: string;
  reason?: string;
};

const formSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120, "Name is too long"),
  customer_phone: z
    .string()
    .trim()
    .regex(/^(\+?\d[\d\s-]{7,15})$/, "Enter a valid mobile number"),
  customer_email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(200)
    .optional()
    .or(z.literal("")),
  visit_date: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export function ReserveDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product;
}) {
  const availableUnit = useMemo(
    () => product.inventory?.find((u) => u.status === "AVAILABLE"),
    [product.inventory],
  );

  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    visit_date: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<
    | null
    | { kind: "conflict" | "unavailable" | "payment_off" | "generic"; message: string }
  >(null);
  const [success, setSuccess] = useState<null | { token?: string; status?: string; message: string }>(null);

  // Fetch availability + amount whenever dialog opens
  useEffect(() => {
    if (!open || !availableUnit) return;
    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    fetch(`/api/public/reservations/availability?unit=${availableUnit.id}`, {
      headers: { Accept: "application/json" },
    })
      .then(async (r) => {
        const j = (await r.json().catch(() => ({}))) as Availability;
        if (cancelled) return;
        setAvailability(j);
      })
      .catch(() => {
        if (!cancelled) setAvailabilityError("Couldn't check availability. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, availableUnit]);

  // Reset transient state when closing
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setErrors({});
        setServerError(null);
        setSuccess(null);
        setSubmitting(false);
      }, 250);
    }
  }, [open]);

  const price = availability?.product_price ?? product.selling_price;
  const amount = availability?.reservation_amount ?? 0;
  const balance = availability?.balance_due ?? Math.max(0, price - amount);
  const paymentReady = availability?.payment_configured === true;

  const canSubmit =
    availability?.available === true &&
    !!availableUnit &&
    !submitting &&
    form.customer_name.trim().length >= 2 &&
    /^(\+?\d[\d\s-]{7,15})$/.test(form.customer_phone.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setServerError(null);
    setErrors({});

    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as string] = issue.message;
      }
      setErrors(next);
      return;
    }
    if (!availableUnit) return;

    setSubmitting(true);
    try {
      const r = await fetch("/api/public/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventory_unit_id: availableUnit.id,
          customer_name: parsed.data.customer_name,
          customer_phone: parsed.data.customer_phone,
          customer_email: parsed.data.customer_email || undefined,
        }),
      });
      const j = await r.json().catch(() => ({}));

      if (r.status === 503 || j?.error === "payment_not_configured") {
        setServerError({
          kind: "payment_off",
          message: "Online reservation payments will be available shortly. Please call or WhatsApp us to hold this device.",
        });
        return;
      }
      if (r.status === 409) {
        setServerError({
          kind: "conflict",
          message:
            "This phone is currently being reserved by another customer. If the payment is not completed, it will become available again shortly.",
        });
        return;
      }
      if (!r.ok) {
        setServerError({
          kind: "generic",
          message: "We couldn't start your reservation. Please try again in a moment.",
        });
        return;
      }

      // Success path — Phase 3 does not open the live gateway. Show a graceful
      // placeholder that a public status link would go here.
      if (j?.public_token) {
        setSuccess({
          token: j.public_token,
          status: j.status,
          message: "Reservation started. Complete payment to confirm.",
        });
      } else {
        setSuccess({
          message: "Reservation started. Complete payment to confirm.",
        });
      }
    } catch {
      setServerError({
        kind: "generic",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary/10 via-card to-card px-6 pt-6 pb-5 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Reserve this phone</span>
          </div>
          <DialogHeader className="mt-2 space-y-1">
            <DialogTitle className="font-display text-xl md:text-2xl font-extrabold tracking-tight">
              {(product.brand?.name ? product.brand.name + " " : "") + product.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {[product.storage, product.ram, product.color].filter(Boolean).join(" · ") || "Reserve to hold this exact unit for you."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <PriceBreakdown
            loading={availabilityLoading}
            price={price}
            amount={amount}
            balance={balance}
          />

          {availabilityError ? (
            <Alert tone="warn" className="mt-4">
              {availabilityError}
            </Alert>
          ) : null}

          {availability && availability.available === false ? (
            <Alert tone="info" className="mt-4">
              <UnavailableMessage reason={availability.reason} />
            </Alert>
          ) : null}

          <AnimatePresence mode="wait">
            {success ? (
              <SuccessState key="success" data={success} />
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleSubmit}
                className="mt-5 space-y-4"
                noValidate
              >
                <Field
                  id="res-name"
                  label="Full name"
                  required
                  error={errors.customer_name}
                >
                  <Input
                    id="res-name"
                    autoComplete="name"
                    value={form.customer_name}
                    onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                    placeholder="e.g. Rahul Kumar"
                    aria-invalid={!!errors.customer_name}
                    disabled={submitting}
                  />
                </Field>

                <Field
                  id="res-phone"
                  label="Mobile number"
                  required
                  error={errors.customer_phone}
                >
                  <Input
                    id="res-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.customer_phone}
                    onChange={(e) => setForm((f) => ({ ...f, customer_phone: e.target.value }))}
                    placeholder="+91 90000 00000"
                    aria-invalid={!!errors.customer_phone}
                    disabled={submitting}
                  />
                </Field>

                <Field
                  id="res-email"
                  label="Email"
                  hint="Optional"
                  error={errors.customer_email}
                >
                  <Input
                    id="res-email"
                    type="email"
                    autoComplete="email"
                    value={form.customer_email}
                    onChange={(e) => setForm((f) => ({ ...f, customer_email: e.target.value }))}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.customer_email}
                    disabled={submitting}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="res-visit" label="Expected visit date" hint="Optional">
                    <Input
                      id="res-visit"
                      type="date"
                      value={form.visit_date}
                      onChange={(e) => setForm((f) => ({ ...f, visit_date: e.target.value }))}
                      disabled={submitting}
                      min={new Date().toISOString().slice(0, 10)}
                    />
                  </Field>
                  <Field id="res-notes" label="Notes" hint="Optional">
                    <Textarea
                      id="res-notes"
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Anything we should know?"
                      rows={1}
                      disabled={submitting}
                      className="resize-none min-h-10"
                    />
                  </Field>
                </div>

                <ul className="mt-2 space-y-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Clock className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    Reservation is valid for <b className="text-foreground">7 days</b> after payment.
                  </li>
                  <li className="flex items-start gap-2">
                    <IndianRupee className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    The <b className="text-foreground">advance</b> is deducted from the final price. Balance is paid in-store.
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    See our <Link to="/refund-policy" className="underline hover:text-foreground">Refund Policy</Link> for cancellations.
                  </li>
                </ul>

                {serverError ? (
                  <Alert tone={serverError.kind === "conflict" ? "info" : "warn"}>
                    {serverError.message}
                  </Alert>
                ) : null}

                {/* Phase 3 payment placeholder */}
                {availability && !paymentReady && !serverError ? (
                  <Alert tone="info">
                    Online reservation payments will be available shortly. You can still reach us to hold this device — call or WhatsApp during business hours.
                  </Alert>
                ) : null}

                <DialogFooter className="pt-1 flex-col-reverse sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                    className="sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmit || !paymentReady}
                    aria-disabled={!canSubmit || !paymentReady}
                    className="min-h-11 sm:w-auto font-bold"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                      </>
                    ) : (
                      <>Proceed to Payment · {formatINR(amount)}</>
                    )}
                  </Button>
                </DialogFooter>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PriceBreakdown({
  loading,
  price,
  amount,
  balance,
}: {
  loading: boolean;
  price: number;
  amount: number;
  balance: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4">
      <Row label="Product price" value={formatINR(price)} muted />
      <div className="my-2 h-px bg-border" />
      <Row
        label="Reservation amount"
        value={loading ? "—" : formatINR(amount)}
        highlight
        hint="Advance · refundable per policy"
      />
      <Row
        label="Remaining (payable in-store)"
        value={loading ? "—" : formatINR(balance)}
        muted
      />
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  highlight,
  hint,
}: {
  label: string;
  value: string;
  muted?: boolean;
  highlight?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className={`text-sm ${muted ? "text-muted-foreground" : "text-foreground font-semibold"}`}>
          {label}
        </div>
        {hint ? <div className="text-[11px] text-muted-foreground">{hint}</div> : null}
      </div>
      <div
        className={`font-num ${highlight ? "text-primary text-lg font-extrabold" : "text-foreground text-sm font-bold"}`}
      >
        {value}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-semibold">
          {label} {required ? <span className="text-primary">*</span> : null}
        </Label>
        {hint ? <span className="text-[10px] text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      ) : null}
    </div>
  );
}

function Alert({
  tone,
  className,
  children,
}: {
  tone: "info" | "warn" | "success";
  className?: string;
  children: React.ReactNode;
}) {
  const styles =
    tone === "success"
      ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
      : tone === "warn"
        ? "border-amber-500/40 bg-amber-500/10 text-foreground"
        : "border-primary/30 bg-primary/5 text-foreground";
  const Icon = tone === "success" ? CheckCircle2 : tone === "warn" ? AlertCircle : Info;
  return (
    <div className={`rounded-xl border p-3 text-sm flex gap-2 items-start ${styles} ${className ?? ""}`}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

function UnavailableMessage({ reason }: { reason?: string }) {
  switch (reason) {
    case "payment_in_progress":
      return (
        <>
          This phone is currently being reserved by another customer. If the payment is not completed, it will become available again shortly.
        </>
      );
    case "already_reserved":
      return <>This phone has just been reserved by another customer.</>;
    case "sold":
      return <>This phone has just been sold.</>;
    default:
      return <>This phone is no longer available for reservation.</>;
  }
}

function SuccessState({ data }: { data: { token?: string; message: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center"
    >
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500/20 text-emerald-600">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div className="mt-3 font-display text-lg font-bold">Reservation started</div>
      <p className="mt-1 text-sm text-muted-foreground">{data.message}</p>
      {data.token ? (
        <Link
          to="/reservation-status/$token"
          params={{ token: data.token }}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90 transition"
        >
          View reservation status
        </Link>
      ) : null}
    </motion.div>
  );
}
