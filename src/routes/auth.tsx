import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/used-mobiles-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Staff Sign In — USED MOBILES" }] }),
  component: AuthPage,
});

const MAX_ATTEMPTS = 10;
const LOCKOUT_MS = 5 * 60 * 1000;
const CAPTCHA_AFTER = 5;
const LS_KEY = "um_auth_attempts_v1";

type AttemptsState = { count: number; lockedUntil: number | null };

function loadAttempts(): AttemptsState {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (!raw) return { count: 0, lockedUntil: null };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function saveAttempts(s: AttemptsState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {}
}

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState<AttemptsState>({ count: 0, lockedUntil: null });
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaRef = useRef<{ a: number; b: number }>({ a: 0, b: 0 });
  const [now, setNow] = useState(Date.now());

  // Initialize and refresh lockout countdown
  useEffect(() => {
    setAttempts(loadAttempts());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Generate a CAPTCHA when needed
  useEffect(() => {
    if (attempts.count >= CAPTCHA_AFTER) {
      captchaRef.current = {
        a: Math.floor(Math.random() * 8) + 1,
        b: Math.floor(Math.random() * 8) + 1,
      };
      setCaptchaInput("");
    }
  }, [attempts.count]);

  useEffect(() => {
    fetch("/api/public/bootstrap-admin", { method: "POST" }).catch(() => {});
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const lockedUntil = attempts.lockedUntil;
  const locked = lockedUntil != null && lockedUntil > now;
  const secsRemaining = locked ? Math.ceil((lockedUntil! - now) / 1000) : 0;
  const showCaptcha = attempts.count >= CAPTCHA_AFTER && !locked;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) {
      toast.error(`Too many failed attempts. Try again in ${secsRemaining}s.`);
      return;
    }
    if (showCaptcha) {
      const expected = captchaRef.current.a + captchaRef.current.b;
      if (Number(captchaInput) !== expected) {
        toast.error("Incorrect verification answer");
        return;
      }
    }
    setLoading(true);

    // Progressive delay (200ms per prior failure, capped)
    const delay = Math.min(attempts.count * 200, 2000);
    if (delay) await new Promise((r) => setTimeout(r, delay));

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Successful login: reset and log
      saveAttempts({ count: 0, lockedUntil: null });
      setAttempts({ count: 0, lockedUntil: null });
      console.info("[auth] login success", { email, t: new Date().toISOString() });
      toast.success("Welcome back");
      navigate({ to: "/admin" });
    } catch (err: any) {
      const next = attempts.count + 1;
      const locked = next >= MAX_ATTEMPTS;
      const newState: AttemptsState = {
        count: locked ? 0 : next,
        lockedUntil: locked ? Date.now() + LOCKOUT_MS : null,
      };
      saveAttempts(newState);
      setAttempts(newState);
      console.warn("[auth] login failed", {
        email,
        attempt: next,
        t: new Date().toISOString(),
      });
      // Generic error — never reveal whether the email exists
      toast.error(
        locked
          ? `Too many failed attempts. Account locked for ${Math.round(LOCKOUT_MS / 60000)} minutes.`
          : "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <Link to="/" className="flex items-center gap-2 mb-6">
          <img src="/USED_MOBILE_LOGO.png" alt="" className="h-10 w-10 object-contain" />
          <div>
            <div className="font-display font-extrabold tracking-tight text-foreground">USED MOBILES</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Staff portal</div>
          </div>
        </Link>

        <h1 className="font-display text-2xl font-bold">Sign in to continue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Internal access for shop staff and admins only.
        </p>

        {locked && (
          <div className="mt-4 rounded-xl border border-ruby/40 bg-ruby/10 p-3 text-sm text-ruby">
            Account temporarily locked due to repeated failed attempts. Try again in{" "}
            <strong className="font-num">{secsRemaining}s</strong>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3" autoComplete="on">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="username"
              required
              disabled={locked}
              className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:border-primary disabled:opacity-60"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              minLength={6}
              disabled={locked}
              className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:border-primary disabled:opacity-60"
            />
          </Field>
          {showCaptcha && (
            <Field label={`Verification — what is ${captchaRef.current.a} + ${captchaRef.current.b}?`}>
              <input
                type="number"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Answer"
                required
                className="h-12 w-full rounded-xl border border-amber/40 bg-amber/5 px-4 outline-none focus:border-primary"
              />
            </Field>
          )}
          <button
            type="submit"
            disabled={loading || locked}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground hover:bg-amber-dark transition disabled:opacity-50"
          >
            {loading ? "Please wait…" : locked ? `Locked (${secsRemaining}s)` : "Sign in"}
          </button>
          {attempts.count > 0 && !locked && (
            <p className="text-center text-[11px] text-muted-foreground">
              {MAX_ATTEMPTS - attempts.count} attempt{MAX_ATTEMPTS - attempts.count === 1 ? "" : "s"} remaining before lockout
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
