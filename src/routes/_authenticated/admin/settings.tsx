import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { deleteAllCustomers, deleteAllBills } from "@/lib/admin-actions.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · Admin" }] }),
  component: SettingsPage,
});

const FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "shop_name", label: "Shop Name" },
  { key: "shop_address", label: "Address" },
  { key: "shop_phone", label: "Phone" },
  { key: "shop_email", label: "Email" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "gst_number", label: "GST Number" },
  { key: "tax_rate", label: "Tax Rate (%)", type: "number" },
  { key: "receipt_footer", label: "Receipt Footer" },
];

function SettingsPage() {
  const { isAdmin, loading } = useCurrentUser();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: settings } = useQuery({
    queryKey: ["shop_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("shop_settings").select("key,value");
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
    },
  });

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = Object.entries(form).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from("shop_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["shop_settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) return <div className="text-admin-muted">Loading…</div>;
  if (!isAdmin) return <div className="rounded-xl border border-admin-border bg-admin-surface p-6 text-admin-muted">Admin access required.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-display text-2xl font-bold">Shop Settings</h1>
        <p className="text-sm text-admin-muted">Configure shop information, tax, and receipts.</p>
      </header>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4 rounded-xl border border-admin-border bg-admin-surface p-6">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted">{f.label}</span>
            <input
              type={f.type ?? "text"}
              value={form[f.key] ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              className="admin-input"
            />
          </label>
        ))}
        <button disabled={save.isPending} className="h-10 rounded-md bg-amber px-5 text-sm font-bold text-ink disabled:opacity-50">
          {save.isPending ? "Saving…" : "Save Settings"}
        </button>
      </form>

      <DangerZone />
    </div>
  );
}

function DangerZone() {
  return (
    <section className="rounded-xl border-2 border-ruby/40 bg-ruby/5 p-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-ruby" />
        <h2 className="font-display text-lg font-bold text-ruby">Danger Zone</h2>
      </div>
      <p className="mt-1 text-xs text-admin-muted">
        Irreversible destructive operations. Use with extreme caution.
      </p>
      <div className="mt-4 space-y-3">
        <DangerAction
          title="Delete all customer history"
          description="Removes every customer record. Inventory and product data are kept. This cannot be undone."
          phrase="DELETE ALL CUSTOMERS"
          action={async () => {
            const { error } = await supabase
              .from("bills")
              .update({ customer_name: null, customer_phone: null } as never)
              .not("id", "is", null);
            if (error) throw error;
          }}
        />
        <DangerAction
          title="Delete all bill history"
          description="Wipes every bill and bill_item record. Inventory units sold via these bills will be reset to AVAILABLE. This cannot be undone."
          phrase="DELETE ALL BILLS"
          action={async () => {
            // Reset inventory units back to AVAILABLE so stock stays consistent.
            await supabase.from("inventory_units").update({ status: "AVAILABLE" }).eq("status", "SOLD");
            await supabase.from("bill_items").delete().not("id", "is", null);
            const { error } = await supabase.from("bills").delete().not("id", "is", null);
            if (error) throw error;
          }}
        />
      </div>
    </section>
  );
}

function DangerAction({
  title,
  description,
  phrase,
  action,
}: {
  title: string;
  description: string;
  phrase: string;
  action: () => Promise<void>;
}) {
  const qc = useQueryClient();
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  function reset() {
    setStage(0);
    setTyped("");
  }

  async function run() {
    if (typed !== phrase) {
      toast.error("Confirmation phrase does not match");
      return;
    }
    setBusy(true);
    try {
      await action();
      toast.success(`${title} — done`);
      qc.invalidateQueries();
      reset();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-ruby/30 bg-admin-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-admin-text">{title}</div>
          <div className="mt-0.5 text-xs text-admin-muted">{description}</div>
        </div>
        {stage === 0 && (
          <button
            onClick={() => setStage(1)}
            className="h-9 shrink-0 rounded-md border border-ruby/50 bg-ruby/10 px-3 text-xs font-semibold text-ruby hover:bg-ruby/20"
          >
            Delete…
          </button>
        )}
      </div>
      {stage === 1 && (
        <div className="mt-3 rounded-md border border-ruby/30 bg-ruby/5 p-3">
          <p className="text-xs text-admin-text">
            Are you absolutely sure? This action <strong>cannot be undone</strong>.
          </p>
          <div className="mt-2 flex gap-2">
            <button onClick={reset} className="h-8 rounded-md border border-admin-border px-3 text-xs">
              Cancel
            </button>
            <button
              onClick={() => setStage(2)}
              className="h-8 rounded-md bg-ruby px-3 text-xs font-semibold text-white"
            >
              Yes, proceed
            </button>
          </div>
        </div>
      )}
      {stage === 2 && (
        <div className="mt-3 rounded-md border border-ruby/30 bg-ruby/5 p-3">
          <p className="text-xs text-admin-text">
            Type <code className="rounded bg-admin-surface-2 px-1.5 py-0.5 font-mono text-ruby">{phrase}</code> to confirm:
          </p>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={phrase}
            className="admin-input mt-2 font-mono"
            autoFocus
          />
          <div className="mt-2 flex gap-2">
            <button onClick={reset} className="h-8 rounded-md border border-admin-border px-3 text-xs">
              Cancel
            </button>
            <button
              onClick={run}
              disabled={busy || typed !== phrase}
              className="h-8 rounded-md bg-ruby px-3 text-xs font-semibold text-white disabled:opacity-40"
            >
              {busy ? "Deleting…" : "I understand, delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
