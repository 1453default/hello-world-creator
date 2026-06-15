import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Plus, Eye, EyeOff, Star } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/admin-utils";

export const Route = createFileRoute("/_authenticated/admin/brands")({
  head: () => ({ meta: [{ title: "Brands · Admin" }] }),
  component: BrandsPage,
});

type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_visible: boolean;
  is_featured: boolean;
  display_order: number;
};

function BrandsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Brand | null>(null);
  const [open, setOpen] = useState(false);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("*").order("display_order");
      if (error) throw error;
      return data as Brand[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Brand deleted");
      qc.invalidateQueries({ queryKey: ["admin", "brands"] });
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Brand> }) => {
      const { error } = await supabase.from("brands").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "brands"] });
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Brands</h1>
          <p className="text-sm text-admin-muted">Manage phone brands shown on the public site.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-amber px-4 text-sm font-bold text-ink hover:bg-amber-dark"
        >
          <Plus className="h-4 w-4" /> New Brand
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">Loading…</td></tr>
            ) : brands.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">No brands yet.</td></tr>
            ) : (
              brands.map((b) => (
                <tr key={b.id} className="hover:bg-admin-surface-2/50">
                  <td className="px-4 py-3 font-semibold">{b.name}</td>
                  <td className="px-4 py-3 text-admin-muted font-mono text-xs">{b.slug}</td>
                  <td className="px-4 py-3">{b.display_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggle.mutate({ id: b.id, patch: { is_visible: !b.is_visible } })}
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${b.is_visible ? "bg-emerald/20 text-emerald" : "bg-admin-surface-2 text-admin-muted"}`}
                      >
                        {b.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {b.is_visible ? "Visible" : "Hidden"}
                      </button>
                      <button
                        onClick={() => toggle.mutate({ id: b.id, patch: { is_featured: !b.is_featured } })}
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${b.is_featured ? "bg-amber/20 text-amber" : "bg-admin-surface-2 text-admin-muted"}`}
                      >
                        <Star className="h-3 w-3" /> {b.is_featured ? "Featured" : "Normal"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setEditing(b); setOpen(true); }}
                      className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirm(`Delete ${b.name}?`) && del.mutate(b.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-ruby/20 hover:text-ruby"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <BrandDialog
          brand={editing}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            qc.invalidateQueries({ queryKey: ["admin", "brands"] });
            qc.invalidateQueries({ queryKey: ["brands"] });
          }}
        />
      )}
    </div>
  );
}

function BrandDialog({ brand, onClose, onSaved }: { brand: Brand | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(brand?.name ?? "");
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [order, setOrder] = useState(brand?.display_order ?? 0);
  const [featured, setFeatured] = useState(brand?.is_featured ?? false);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const finalSlug = slug.trim() || slugify(name);
      const payload = { name: name.trim(), slug: finalSlug, display_order: order, is_featured: featured };
      const { error } = brand
        ? await supabase.from("brands").update(payload).eq("id", brand.id)
        : await supabase.from("brands").insert(payload);
      if (error) throw error;
      toast.success(brand ? "Updated" : "Created");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={save}
        className="w-full max-w-md space-y-4 rounded-xl border border-admin-border bg-admin-surface p-6"
      >
        <h2 className="font-display text-lg font-bold">{brand ? "Edit" : "New"} Brand</h2>
        <Field label="Name">
          <input value={name} onChange={(e) => { setName(e.target.value); if (!brand) setSlug(slugify(e.target.value)); }} required className="admin-input" />
        </Field>
        <Field label="Slug">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="admin-input font-mono text-sm" />
        </Field>
        <Field label="Display Order">
          <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="admin-input" />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured on home page
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-admin-border px-4 text-sm">Cancel</button>
          <button disabled={saving} className="h-9 rounded-md bg-amber px-4 text-sm font-bold text-ink disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted">{label}</span>
      {children}
    </label>
  );
}
