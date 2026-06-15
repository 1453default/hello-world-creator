import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · Admin" }] }),
  component: SettingsPage,
});

const FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "shop_name", label: "Shop Name" },
  { key: "shop_address", label: "Address" },
  { key: "shop_phone", label: "Phone" },
  { key: "shop_email", label: "Email" },
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
    </div>
  );
}
