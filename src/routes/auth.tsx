import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/used-mobiles-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Staff Sign In — USED MOBILES" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fire-and-forget idempotent admin bootstrap
    fetch("/api/public/bootstrap-admin", { method: "POST" }).catch(() => {});

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back");
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err?.message || "Invalid email or password");
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
          <img src={logoAsset.url} alt="" className="h-10 w-10 object-contain" />
          <div>
            <div className="font-display font-extrabold tracking-tight text-foreground">USED MOBILES</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Staff portal</div>
          </div>
        </Link>

        <h1 className="font-display text-2xl font-bold">Sign in to continue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Internal access for shop staff and admins only.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3" autoComplete="on">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="username"
              required
              className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
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
              className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground hover:bg-amber-dark transition disabled:opacity-50"
          >
            {loading ? "Please wait…" : "Sign in"}
          </button>
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
