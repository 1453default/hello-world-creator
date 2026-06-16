import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Plus, Eye, EyeOff, Star, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/admin-utils";
import { formatINR } from "@/lib/shop";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Products · Admin" }] }),
  component: ProductsPage,
});

type Product = {
  id: string;
  brand_id: string | null;
  name: string;
  slug: string;
  model: string | null;
  storage: string | null;
  ram: string | null;
  color: string | null;
  condition: string;
  description: string | null;
  selling_price: number;
  is_featured: boolean;
  is_listed: boolean;
  is_deleted: boolean;
};

function ProductsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, brand:brands(name)")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (Product & { brand: { name: string } | null })[];
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["admin", "brands-list"],
    queryFn: async () => {
      const { data } = await supabase.from("brands").select("id,name").order("name");
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").update({ is_deleted: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product removed");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products", "all"] });
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Product> }) => {
      const { error } = await supabase.from("products").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products", "all"] });
    },
  });

  const filtered = products.filter(
    (p) => !filter || p.name.toLowerCase().includes(filter.toLowerCase()) || p.brand?.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-sm text-admin-muted">Phone models shown in the catalog.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-amber px-4 text-sm font-bold text-ink hover:bg-amber-dark"
        >
          <Plus className="h-4 w-4" /> New Product
        </button>
      </header>

      <input
        placeholder="Filter by name or brand…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="admin-input max-w-sm"
      />

      <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Storage</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-admin-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-admin-muted">No products.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-admin-surface-2/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="font-mono text-[10px] text-admin-subtle">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-admin-muted">{p.brand?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-admin-muted">{p.storage ?? "—"}</td>
                  <td className="px-4 py-3 font-num font-semibold">{formatINR(p.selling_price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => toggle.mutate({ id: p.id, patch: { is_listed: !p.is_listed } })}
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${p.is_listed ? "bg-emerald/20 text-emerald" : "bg-admin-surface-2 text-admin-muted"}`}
                      >
                        {p.is_listed ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {p.is_listed ? "Live" : "Draft"}
                      </button>
                      <button
                        onClick={() => toggle.mutate({ id: p.id, patch: { is_featured: !p.is_featured } })}
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${p.is_featured ? "bg-amber/20 text-amber" : "bg-admin-surface-2 text-admin-muted"}`}
                      >
                        <Star className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/phone/$slug" params={{ slug: p.slug }} target="_blank" className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-admin-surface-2"><ExternalLink className="h-4 w-4" /></Link>
                    <button onClick={() => { setEditing(p); setOpen(true); }} className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => confirm(`Delete ${p.name}?`) && del.mutate(p.id)} className="inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-ruby/20 hover:text-ruby"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <ProductDialog
          product={editing}
          brands={brands as { id: string; name: string }[]}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            qc.invalidateQueries({ queryKey: ["admin", "products"] });
            qc.invalidateQueries({ queryKey: ["products", "all"] });
          }}
        />
      )}
    </div>
  );
}

function ProductDialog({ product, brands, onClose, onSaved }: {
  product: Product | null;
  brands: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    brand_id: product?.brand_id ?? brands[0]?.id ?? "",
    storage: product?.storage ?? "",
    ram: product?.ram ?? "",
    color: product?.color ?? "",
    condition: product?.condition ?? "good",
    selling_price: product?.selling_price ?? 0,
    description: product?.description ?? "",
    is_featured: product?.is_featured ?? false,
    is_listed: product?.is_listed ?? true,
    imei: "",
    cost_price: "" as number | "",
  });
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(product?.id ?? null);

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const finalSlug = form.slug.trim() || slugify(form.name);
      const payload = {
        name: form.name.trim(),
        slug: finalSlug,
        brand_id: form.brand_id || null,
        storage: form.storage || null,
        ram: form.ram || null,
        color: form.color || null,
        condition: form.condition,
        selling_price: Number(form.selling_price),
        description: form.description || null,
        is_featured: form.is_featured,
        is_listed: form.is_listed,
      };
      if (createdId) {
        const { error } = await supabase.from("products").update(payload).eq("id", createdId);
        if (error) throw error;
        toast.success("Updated");
        onSaved();
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        // Auto-create one inventory unit so the new product shows as AVAILABLE
        // (without this, the catalog renders it as "Sold Out" because available_count === 0).
        const { error: invErr } = await supabase.from("inventory_units").insert({
          product_id: data.id,
          imei: form.imei.trim() || null,
          cost_price: form.cost_price === "" ? null : Number(form.cost_price),
          status: "AVAILABLE",
        });
        if (invErr) throw invErr;
        setCreatedId(data.id);
        qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
        toast.success("Product created with 1 inventory unit — add images");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="my-8 w-full max-w-2xl space-y-4 rounded-xl border border-admin-border bg-admin-surface p-6">
        <h2 className="font-display text-lg font-bold">{product || createdId ? "Edit" : "New"} Product</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <input value={form.name} onChange={(e) => { set("name", e.target.value); if (!product && !createdId) set("slug", slugify(e.target.value)); }} required className="admin-input" />
          </Field>
          <Field label="Slug">
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className="admin-input font-mono text-sm" />
          </Field>
          <Field label="Brand">
            <select value={form.brand_id} onChange={(e) => set("brand_id", e.target.value)} className="admin-input">
              <option value="">— None —</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Condition">
            <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className="admin-input">
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </Field>
          <Field label="Storage"><input value={form.storage} onChange={(e) => set("storage", e.target.value)} className="admin-input" placeholder="128GB" /></Field>
          <Field label="RAM"><input value={form.ram} onChange={(e) => set("ram", e.target.value)} className="admin-input" placeholder="8GB" /></Field>
          <Field label="Color"><input value={form.color} onChange={(e) => set("color", e.target.value)} className="admin-input" /></Field>
          <Field label="Selling Price (₹)"><input type="number" value={form.selling_price} onChange={(e) => set("selling_price", Number(e.target.value))} className="admin-input" /></Field>
        </div>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="admin-input" />
        </Field>
        {createdId ? (
          <div className="rounded-lg border border-admin-border bg-admin-surface-2 p-3">
            <ProductImagesManager productId={createdId} />
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-admin-border bg-admin-surface-2 p-3 text-xs text-admin-muted">
            Save the product first, then upload images.
          </div>
        )}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_listed} onChange={(e) => set("is_listed", e.target.checked)} /> Listed (live on site)</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Featured</label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-admin-border px-4 text-sm">{createdId ? "Done" : "Cancel"}</button>
          <button disabled={saving} className="h-9 rounded-md bg-amber px-4 text-sm font-bold text-ink disabled:opacity-50">{saving ? "Saving…" : createdId ? "Save Changes" : "Create"}</button>
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
