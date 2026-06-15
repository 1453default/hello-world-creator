import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory · Admin" }] }),
  component: InventoryPage,
});

type Unit = {
  id: string;
  product_id: string;
  imei: string | null;
  cost_price: number | null;
  status: string;
  notes: string | null;
  product: { name: string; selling_price: number; brand: { name: string } | null } | null;
};

const STATUSES = ["AVAILABLE", "RESERVED", "SOLD", "SCRAP"];

function InventoryPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const { data: units = [], isLoading } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_units")
        .select("*, product:products(name, selling_price, brand:brands(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Unit[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("inventory_units").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
      qc.invalidateQueries({ queryKey: ["products", "all"] });
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory_units").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
  });

  const filtered = statusFilter ? units.filter((u) => u.status === statusFilter) : units;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-admin-muted">{units.length} units · {units.filter((u) => u.status === "AVAILABLE").length} available</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-md bg-amber px-4 text-sm font-bold text-ink hover:bg-amber-dark">
          <Plus className="h-4 w-4" /> Add Unit
        </button>
      </header>

      <div className="flex gap-2">
        <button onClick={() => setStatusFilter("")} className={`rounded-md border border-admin-border px-3 py-1.5 text-xs ${!statusFilter ? "bg-admin-surface-2" : ""}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-md border border-admin-border px-3 py-1.5 text-xs ${statusFilter === s ? "bg-admin-surface-2" : ""}`}>{s}</button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">IMEI</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Sell</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-admin-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-admin-muted">No units.</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{u.product?.name}</div>
                    <div className="text-xs text-admin-muted">{u.product?.brand?.name}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{u.imei ?? "—"}</td>
                  <td className="px-4 py-3 font-num text-admin-muted">{u.cost_price ? formatINR(u.cost_price) : "—"}</td>
                  <td className="px-4 py-3 font-num">{u.product ? formatINR(u.product.selling_price) : "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.status}
                      onChange={(e) => setStatus.mutate({ id: u.id, status: e.target.value })}
                      className="admin-input h-8 py-0 text-xs"
                    >
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => confirm("Delete this unit?") && del.mutate(u.id)} className="inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-ruby/20 hover:text-ruby"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && <AddUnitDialog onClose={() => setOpen(false)} onSaved={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin", "inventory"] }); qc.invalidateQueries({ queryKey: ["products", "all"] }); }} />}
    </div>
  );
}

function AddUnitDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [productId, setProductId] = useState("");
  const [imei, setImei] = useState("");
  const [cost, setCost] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["admin", "products-list"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id,name,brand:brands(name)").eq("is_deleted", false).order("name");
      return data ?? [];
    },
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("inventory_units").insert({
        product_id: productId,
        imei: imei.trim() || null,
        cost_price: cost === "" ? null : Number(cost),
        status: "AVAILABLE",
      });
      if (error) throw error;
      toast.success("Unit added");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="w-full max-w-md space-y-4 rounded-xl border border-admin-border bg-admin-surface p-6">
        <h2 className="font-display text-lg font-bold">Add Inventory Unit</h2>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Product</span>
          <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="admin-input">
            <option value="">— Select —</option>
            {(products as any[]).map((p) => <option key={p.id} value={p.id}>{p.brand?.name} {p.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted">IMEI (optional, unique)</span>
          <input value={imei} onChange={(e) => setImei(e.target.value)} className="admin-input font-mono" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Cost Price (₹)</span>
          <input type="number" value={cost} onChange={(e) => setCost(e.target.value === "" ? "" : Number(e.target.value))} className="admin-input" />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-admin-border px-4 text-sm">Cancel</button>
          <button disabled={saving} className="h-9 rounded-md bg-amber px-4 text-sm font-bold text-ink disabled:opacity-50">{saving ? "Saving…" : "Add"}</button>
        </div>
      </form>
    </div>
  );
}
