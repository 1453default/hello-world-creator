import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
const FragmentRow = Fragment;
import {
  Pencil, Trash2, Plus, Eye, EyeOff, Star, ExternalLink, ChevronDown, ChevronRight,
  Copy, Download, Search, MoreVertical, Activity, CheckCircle2, ShoppingBag, Clock3, Printer, History,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/admin-utils";
import { formatINR } from "@/lib/shop";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Products · Admin" }] }),
  component: ProductsPage,
});

type UnitStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "SCRAP";
const UNIT_STATUSES: UnitStatus[] = ["AVAILABLE", "RESERVED", "SOLD", "SCRAP"];

type InventoryUnit = {
  id: string;
  product_id: string;
  imei: string | null;
  serial: string | null;
  cost_price: number | null;
  status: UnitStatus;
  notes: string | null;
  supplier: string | null;
  purchase_date: string | null;
  warranty_until: string | null;
  sold_at: string | null;
  created_at: string;
  updated_at: string;
  bill_items?: { bill: { id: string; bill_number: string | null; customer_name: string | null; customer_phone: string | null; created_at: string } | null }[];
};

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
  created_at: string;
  updated_at: string;
};

type ProductRow = Product & {
  brand: { name: string } | null;
  inventory: InventoryUnit[];
  primary_image: string | null;
  available_count: number;
  reserved_count: number;
  sold_count: number;
  scrap_count: number;
  total_count: number;
  min_cost: number | null;
  max_cost: number | null;
};

type FilterKey =
  | "all" | "available" | "low_stock" | "sold" | "reserved" | "hidden" | "featured";

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  AVAILABLE: { label: "Available", cls: "bg-emerald/20 text-emerald" },
  RESERVED: { label: "Reserved", cls: "bg-sky/20 text-sky-300" },
  SOLD: { label: "Sold", cls: "bg-ruby/20 text-ruby" },
  SCRAP: { label: "Scrap", cls: "bg-zinc-500/20 text-zinc-300" },
  LOW: { label: "Low Stock", cls: "bg-amber/20 text-amber" },
  OUT: { label: "Out of Stock", cls: "bg-ruby/20 text-ruby" },
  HIDDEN: { label: "Hidden", cls: "bg-zinc-500/20 text-zinc-300" },
  DRAFT: { label: "Draft", cls: "bg-zinc-600/30 text-zinc-200" },
  FEATURED: { label: "Featured", cls: "bg-amber/20 text-amber" },
};

function Badge({ k, children }: { k: string; children?: ReactNode }) {
  const b = STATUS_BADGES[k] ?? { label: k, cls: "bg-admin-surface-2 text-admin-muted" };
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${b.cls}`}>
      {children ?? b.label}
    </span>
  );
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
}

function ProductsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [sort, setSort] = useState<"newest" | "oldest" | "price_asc" | "price_desc">("newest");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async (): Promise<ProductRow[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brand:brands(name),
          inventory:inventory_units(id,product_id,imei,serial,cost_price,status,notes,supplier,purchase_date,warranty_until,sold_at,created_at,updated_at,bill_items(bill:bills(id,bill_number,customer_name,customer_phone,created_at))),
          images:product_images(url,is_primary,display_order)
        `)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((p: any) => {
        const inv: InventoryUnit[] = (p.inventory ?? []) as InventoryUnit[];
        const costs = inv.map((u) => u.cost_price).filter((c): c is number => c != null);
        const imgs = (p.images ?? []) as { url: string; is_primary: boolean; display_order: number }[];
        const primary = imgs.find((i) => i.is_primary) ?? imgs.sort((a, b) => a.display_order - b.display_order)[0] ?? null;
        const row: ProductRow = {
          ...(p as Product),
          brand: p.brand,
          inventory: inv,
          primary_image: primary?.url ?? null,
          available_count: inv.filter((u) => u.status === "AVAILABLE").length,
          reserved_count: inv.filter((u) => u.status === "RESERVED").length,
          sold_count: inv.filter((u) => u.status === "SOLD").length,
          scrap_count: inv.filter((u) => u.status === "SCRAP").length,
          total_count: inv.length,
          min_cost: costs.length ? Math.min(...costs) : null,
          max_cost: costs.length ? Math.max(...costs) : null,
        };
        return row;
      });
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["admin", "brands-list"],
    queryFn: async () => {
      const { data } = await supabase.from("brands").select("id,name").order("name");
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  // Server-side bill/customer search → returns product_ids to include
  const billSearch = useQuery({
    queryKey: ["admin", "products", "bill-search", search],
    enabled: search.trim().length >= 2,
    queryFn: async (): Promise<Set<string>> => {
      const q = search.trim();
      const { data: bills } = await supabase
        .from("bills")
        .select("id")
        .or(`bill_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`)
        .limit(200);
      const billIds = (bills ?? []).map((b) => b.id);
      if (billIds.length === 0) return new Set();
      const { data: items } = await supabase
        .from("bill_items")
        .select("product_id")
        .in("bill_id", billIds);
      return new Set((items ?? []).map((i) => i.product_id).filter(Boolean) as string[]);
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["products", "all"] });
  };

  const updateProduct = useMutation({
    mutationFn: async ({ ids, patch }: { ids: string[]; patch: Partial<Product> }) => {
      const { error } = await supabase.from("products").update(patch).in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, v) => { toast.success(`${v.ids.length} updated`); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteProducts = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("products").update({ is_deleted: true }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, ids) => { toast.success(`${ids.length} removed`); setSelected(new Set()); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkUnitStatus = useMutation({
    mutationFn: async ({ productIds, status }: { productIds: string[]; status: UnitStatus }) => {
      const { error } = await supabase
        .from("inventory_units")
        .update({ status, sold_at: status === "SOLD" ? new Date().toISOString() : null })
        .in("product_id", productIds)
        .neq("status", status);
      if (error) throw error;
    },
    onSuccess: (_d, v) => { toast.success(`Marked ${v.status.toLowerCase()}`); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const billIds = billSearch.data;
    let list = products.filter((p) => {
      if (brandFilter && p.brand_id !== brandFilter) return false;
      switch (filter) {
        case "available": if (p.available_count === 0) return false; break;
        case "low_stock": if (!(p.available_count > 0 && p.available_count <= 1)) return false; break;
        case "sold": if (p.sold_count === 0) return false; break;
        case "reserved": if (p.reserved_count === 0) return false; break;
        case "hidden": if (p.is_listed) return false; break;
        case "featured": if (!p.is_featured) return false; break;
      }
      if (!q) return true;
      const inText = [
        p.name, p.brand?.name, p.model, p.storage, p.ram, p.color, p.slug,
      ].filter(Boolean).join(" ").toLowerCase().includes(q);
      const inImei = p.inventory.some((u) =>
        (u.imei?.toLowerCase().includes(q)) || (u.serial?.toLowerCase().includes(q))
      );
      const inBill = billIds?.has(p.id) ?? false;
      return inText || inImei || inBill;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest": return a.created_at.localeCompare(b.created_at);
        case "price_asc": return a.selling_price - b.selling_price;
        case "price_desc": return b.selling_price - a.selling_price;
        default: return b.created_at.localeCompare(a.created_at);
      }
    });
    return list;
  }, [products, search, filter, brandFilter, sort, billSearch.data]);

  function toggleSelect(id: string, on: boolean) {
    setSelected((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
  }
  function toggleExpand(id: string) {
    setExpanded((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  async function duplicate(p: ProductRow) {
    const newName = `${p.name} (copy)`;
    const baseSlug = slugify(newName);
    const newSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from("products").insert({
      brand_id: p.brand_id, name: newName, slug: newSlug, model: p.model,
      storage: p.storage, ram: p.ram, color: p.color, condition: p.condition,
      description: p.description, selling_price: p.selling_price,
      is_featured: false, is_listed: false,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Duplicated as Draft");
    invalidate();
  }

  function exportCSV(rows: ProductRow[]) {
    const headers = [
      "Brand","Model","Storage","RAM","Color","IMEIs","Purchase Price (min)","Purchase Price (max)",
      "Selling Price","Available","Sold","Reserved","Listed","Featured","Created","Updated",
    ];
    const lines = [headers.join(",")];
    for (const p of rows) {
      const imeis = p.inventory.map((u) => u.imei).filter(Boolean).join("|");
      const cells = [
        p.brand?.name ?? "", p.model ?? p.name, p.storage ?? "", p.ram ?? "", p.color ?? "",
        imeis, p.min_cost ?? "", p.max_cost ?? "", p.selling_price,
        p.available_count, p.sold_count, p.reserved_count,
        p.is_listed ? "yes" : "no", p.is_featured ? "yes" : "no",
        p.created_at, p.updated_at,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
      lines.push(cells.join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const selectedIds = Array.from(selected);
  const counts = {
    all: products.length,
    available: products.filter((p) => p.available_count > 0).length,
    low_stock: products.filter((p) => p.available_count > 0 && p.available_count <= 1).length,
    sold: products.filter((p) => p.sold_count > 0).length,
    reserved: products.filter((p) => p.reserved_count > 0).length,
    hidden: products.filter((p) => !p.is_listed).length,
    featured: products.filter((p) => p.is_featured).length,
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-sm text-admin-muted">
            Unified product & inventory management — {products.length} products · {products.reduce((s, p) => s + p.available_count, 0)} units available
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(filtered)} className="inline-flex h-10 items-center gap-2 rounded-md border border-admin-border bg-admin-surface px-4 text-sm font-semibold text-admin-text hover:bg-admin-surface-2">
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => { setEditing(null); setDialogOpen(true); }} className="inline-flex h-10 items-center gap-2 rounded-md bg-amber px-4 text-sm font-bold text-ink hover:bg-amber-dark">
            <Plus className="h-4 w-4" /> New Product
          </button>
        </div>
      </header>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
          <input
            placeholder="Search IMEI, brand, model, color, storage, RAM, customer, bill #…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="admin-input w-full pl-9"
          />
        </div>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="admin-input h-10 w-40">
          <option value="">All brands</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="admin-input h-10 w-36">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_desc">Price ↓</option>
          <option value="price_asc">Price ↑</option>
        </select>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(counts) as FilterKey[]).map((k) => (
          <button
            key={k} onClick={() => setFilter(k)}
            className={`rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${filter === k ? "border-amber bg-amber/10 text-amber" : "border-admin-border bg-admin-surface text-admin-muted hover:text-admin-text"}`}
          >
            {k.replace("_", " ")} <span className="ml-1 opacity-70">{counts[k]}</span>
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber/30 bg-amber/5 px-3 py-2 text-sm">
          <span className="font-semibold">{selectedIds.length} selected</span>
          <span className="text-admin-muted">·</span>
          <button onClick={() => updateProduct.mutate({ ids: selectedIds, patch: { is_listed: false } })} className="rounded bg-admin-surface px-2 py-1 text-xs hover:bg-admin-surface-2">Hide</button>
          <button onClick={() => updateProduct.mutate({ ids: selectedIds, patch: { is_listed: true } })} className="rounded bg-admin-surface px-2 py-1 text-xs hover:bg-admin-surface-2">Unhide</button>
          <button onClick={() => bulkUnitStatus.mutate({ productIds: selectedIds, status: "SOLD" })} className="rounded bg-admin-surface px-2 py-1 text-xs hover:bg-admin-surface-2">Mark Sold</button>
          <button onClick={() => bulkUnitStatus.mutate({ productIds: selectedIds, status: "AVAILABLE" })} className="rounded bg-admin-surface px-2 py-1 text-xs hover:bg-admin-surface-2">Mark Available</button>
          <button onClick={() => exportCSV(products.filter((p) => selected.has(p.id)))} className="rounded bg-admin-surface px-2 py-1 text-xs hover:bg-admin-surface-2">Export</button>
          <button onClick={() => confirm(`Delete ${selectedIds.length} products? Bills and sold history are preserved.`) && deleteProducts.mutate(selectedIds)} className="rounded bg-ruby/20 px-2 py-1 text-xs text-ruby hover:bg-ruby/30">Delete</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-admin-muted hover:text-admin-text">Clear</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-admin-border bg-admin-surface">
        <table className="w-full min-w-[1024px] text-sm">
          <thead className="bg-admin-surface-2 text-left text-[11px] uppercase tracking-wider text-admin-muted">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox" checked={allSelected}
                  onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((p) => p.id)) : new Set())}
                />
              </th>
              <th className="w-8 px-2"></th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Brand</th>
              <th className="px-3 py-3">Specs</th>
              <th className="px-3 py-3">IMEI</th>
              <th className="px-3 py-3 text-right">Purchase</th>
              <th className="px-3 py-3 text-right">Sell</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Dates</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-admin-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={11} className="px-4 py-10 text-center text-admin-muted">No products match.</td></tr>
            ) : filtered.map((p) => {
              const isOpen = expanded.has(p.id);
              const isOut = p.total_count > 0 && p.available_count === 0 && p.reserved_count === 0;
              const lowStock = p.available_count > 0 && p.available_count <= 1;
              const imeiList = p.inventory.map((u) => u.imei).filter(Boolean) as string[];
              const primaryStatus: string =
                p.total_count === 0 ? "DRAFT"
                : !p.is_listed ? "HIDDEN"
                : isOut ? "SOLD"
                : p.reserved_count > 0 && p.available_count === 0 ? "RESERVED"
                : lowStock ? "LOW"
                : "AVAILABLE";
              return (
                <FragmentRow key={p.id}>
                  <tr className="hover:bg-admin-surface-2/40">
                    <td className="px-3 py-2 align-middle">
                      <input type="checkbox" checked={selected.has(p.id)} onChange={(e) => toggleSelect(p.id, e.target.checked)} />
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <button onClick={() => toggleExpand(p.id)} className="text-admin-muted hover:text-admin-text">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-admin-border bg-admin-surface-2">
                          {p.primary_image ? (
                            <img src={p.primary_image} alt="" className="h-full w-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[9px] text-admin-subtle">no img</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{p.name}</div>
                          <div className="truncate font-mono text-[10px] text-admin-subtle">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle text-admin-muted">{p.brand?.name ?? "—"}</td>
                    <td className="px-3 py-2 align-middle text-xs text-admin-muted">
                      <div>{p.storage ?? "—"} · {p.ram ?? "—"}</div>
                      <div className="text-admin-subtle">{p.color ?? "—"}</div>
                    </td>
                    <td className="px-3 py-2 align-middle font-mono text-[11px] text-admin-muted">
                      {imeiList.length === 0 ? "—" : imeiList.length === 1 ? imeiList[0] : (
                        <span title={imeiList.join("\n")}>{imeiList[0]} <span className="text-admin-subtle">+{imeiList.length - 1}</span></span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle text-right font-num text-admin-muted">
                      {p.min_cost == null ? "—" : p.min_cost === p.max_cost ? formatINR(p.min_cost) : `${formatINR(p.min_cost)}–${formatINR(p.max_cost!)}`}
                    </td>
                    <td className="px-3 py-2 align-middle text-right font-num font-semibold">{formatINR(p.selling_price)}</td>
                    <td className="px-3 py-2 align-middle">
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge k={primaryStatus} />
                        {p.is_featured && <Badge k="FEATURED" />}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle text-[11px] text-admin-muted">
                      <div>C {fmtDate(p.created_at)}</div>
                      <div>U {fmtDate(p.updated_at)}</div>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <div className="flex items-center justify-end gap-0.5">
                        <IconBtn title="View public" onClick={() => window.open(`/phone/${p.slug}`, "_blank")}><ExternalLink className="h-3.5 w-3.5" /></IconBtn>
                        <IconBtn title="Edit" onClick={() => { setEditing(p); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></IconBtn>
                        <StatusMenu
                          product={p}
                          onPick={(s) => bulkUnitStatus.mutate({ productIds: [p.id], status: s })}
                          onHide={() => updateProduct.mutate({ ids: [p.id], patch: { is_listed: false } })}
                          onUnhide={() => updateProduct.mutate({ ids: [p.id], patch: { is_listed: true } })}
                        />
                        <IconBtn title="Delete" danger onClick={() => confirm(`Delete ${p.name}?${p.sold_count > 0 ? "\nSold history is preserved." : ""}`) && deleteProducts.mutate([p.id])}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconBtn>
                        <MoreMenu
                          product={p}
                          onDuplicate={() => duplicate(p)}
                          onToggleFeature={() => updateProduct.mutate({ ids: [p.id], patch: { is_featured: !p.is_featured } })}
                          onToggleHidden={() => updateProduct.mutate({ ids: [p.id], patch: { is_listed: !p.is_listed } })}
                          onExport={() => exportCSV([p])}
                        />
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-admin-surface-2/30">
                      <td colSpan={11} className="px-4 py-4">
                        <ExpandedDetail product={p} onChanged={invalidate} />
                      </td>
                    </tr>
                  )}
                </FragmentRow>
              );
            })}
          </tbody>
        </table>
      </div>


      {dialogOpen && (
        <ProductDialog
          product={editing}
          brands={brands}
          onClose={() => setDialogOpen(false)}
          onSaved={() => { setDialogOpen(false); invalidate(); }}
        />
      )}
    </div>
  );
}

function IconBtn({ children, onClick, title, danger }: { children: ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button
      title={title} onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded text-admin-muted ${danger ? "hover:bg-ruby/20 hover:text-ruby" : "hover:bg-admin-surface hover:text-admin-text"}`}
    >{children}</button>
  );
}

function useClickAway<T extends HTMLElement>(onAway: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onAway();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onAway]);
  return ref;
}

function StatusMenu({ product, onPick, onHide, onUnhide }: {
  product: ProductRow;
  onPick: (s: UnitStatus) => void;
  onHide: () => void;
  onUnhide: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickAway<HTMLDivElement>(() => setOpen(false));
  const item = "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-admin-surface-2";
  return (
    <div className="relative" ref={ref}>
      <button
        title="Status" onClick={() => setOpen((v) => !v)}
        className="inline-flex h-7 w-7 items-center justify-center rounded text-admin-muted hover:bg-admin-surface hover:text-admin-text"
      ><Activity className="h-3.5 w-3.5" /></button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-admin-border bg-admin-surface shadow-lg">
          <button className={item} onClick={() => { setOpen(false); onPick("AVAILABLE"); }}>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald" /> Available
          </button>
          <button className={item} onClick={() => { setOpen(false); onPick("SOLD"); }}>
            <ShoppingBag className="h-3.5 w-3.5 text-ruby" /> Sold
          </button>
          <button className={item} onClick={() => { setOpen(false); onPick("RESERVED"); }}>
            <Clock3 className="h-3.5 w-3.5 text-sky-300" /> Reserved
          </button>
          <div className="my-1 h-px bg-admin-border" />
          {product.is_listed ? (
            <button className={item} onClick={() => { setOpen(false); onHide(); }}>
              <EyeOff className="h-3.5 w-3.5" /> Hidden (unlist)
            </button>
          ) : (
            <button className={item} onClick={() => { setOpen(false); onUnhide(); }}>
              <Eye className="h-3.5 w-3.5" /> Unhide (list)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MoreMenu({ product, onDuplicate, onToggleFeature, onToggleHidden, onExport }: {
  product: ProductRow;
  onDuplicate: () => void;
  onToggleFeature: () => void;
  onToggleHidden: () => void;
  onExport: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickAway<HTMLDivElement>(() => setOpen(false));
  const item = "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-admin-surface-2";
  const disabled = "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-admin-subtle cursor-not-allowed";
  return (
    <div className="relative" ref={ref}>
      <button
        title="More" onClick={() => setOpen((v) => !v)}
        className="inline-flex h-7 w-7 items-center justify-center rounded text-admin-muted hover:bg-admin-surface hover:text-admin-text"
      ><MoreVertical className="h-3.5 w-3.5" /></button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-md border border-admin-border bg-admin-surface shadow-lg">
          <button className={item} onClick={() => { setOpen(false); onDuplicate(); }}>
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </button>
          <button className={item} onClick={() => { setOpen(false); onToggleFeature(); }}>
            <Star className={`h-3.5 w-3.5 ${product.is_featured ? "text-amber" : ""}`} /> {product.is_featured ? "Remove Feature" : "Feature"}
          </button>
          <button className={item} onClick={() => { setOpen(false); onToggleHidden(); }}>
            {product.is_listed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {product.is_listed ? "Hide" : "Unhide"}
          </button>
          <button className={item} onClick={() => { setOpen(false); onExport(); }}>
            <Download className="h-3.5 w-3.5" /> Export single (CSV)
          </button>
          <div className="my-1 h-px bg-admin-border" />
          <button className={disabled} disabled title="Coming soon">
            <Printer className="h-3.5 w-3.5" /> Print Label (soon)
          </button>
          <button className={disabled} disabled title="Coming soon">
            <History className="h-3.5 w-3.5" /> Audit History (soon)
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Expanded row: inventory editor + images + bills ---------------- */

function ExpandedDetail({ product, onChanged }: { product: ProductRow; onChanged: () => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <InventoryEditor product={product} onChanged={onChanged} />
        <BillsForProduct productId={product.id} />
      </div>
      <div className="rounded-lg border border-admin-border bg-admin-surface p-3">
        <ProductImagesManager productId={product.id} />
      </div>
    </div>
  );
}

function InventoryEditor({ product, onChanged }: { product: ProductRow; onChanged: () => void }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ imei: "", cost_price: "" as number | "", supplier: "", purchase_date: "", warranty_until: "" });

  async function updateUnit(id: string, patch: Partial<InventoryUnit>) {
    const next: any = { ...patch };
    if (patch.status === "SOLD") next.sold_at = next.sold_at ?? new Date().toISOString();
    if (patch.status && patch.status !== "SOLD") next.sold_at = null;
    const { error } = await supabase.from("inventory_units").update(next).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    onChanged();
  }

  async function delUnit(id: string) {
    if (!confirm("Delete this unit?")) return;
    const { error } = await supabase.from("inventory_units").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Removed"); onChanged();
  }

  async function addUnit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("inventory_units").insert({
      product_id: product.id,
      imei: draft.imei.trim() || null,
      cost_price: draft.cost_price === "" ? null : Number(draft.cost_price),
      supplier: draft.supplier.trim() || null,
      purchase_date: draft.purchase_date || null,
      warranty_until: draft.warranty_until || null,
      status: "AVAILABLE",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Unit added");
    setDraft({ imei: "", cost_price: "", supplier: "", purchase_date: "", warranty_until: "" });
    setAdding(false); onChanged();
  }

  return (
    <div className="rounded-lg border border-admin-border bg-admin-surface">
      <div className="flex items-center justify-between border-b border-admin-border px-3 py-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-admin-muted">Inventory ({product.inventory.length})</h3>
        <button onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1 rounded bg-amber px-2 py-1 text-xs font-bold text-ink">
          <Plus className="h-3 w-3" /> Add Unit
        </button>
      </div>
      {adding && (
        <form onSubmit={addUnit} className="grid grid-cols-2 gap-2 border-b border-admin-border bg-admin-surface-2 p-3 md:grid-cols-5">
          <input placeholder="IMEI" value={draft.imei} onChange={(e) => setDraft({ ...draft, imei: e.target.value })} className="admin-input font-mono text-xs" />
          <input type="number" placeholder="Cost ₹" value={draft.cost_price} onChange={(e) => setDraft({ ...draft, cost_price: e.target.value === "" ? "" : Number(e.target.value) })} className="admin-input text-xs" />
          <input placeholder="Supplier" value={draft.supplier} onChange={(e) => setDraft({ ...draft, supplier: e.target.value })} className="admin-input text-xs" />
          <input type="date" value={draft.purchase_date} onChange={(e) => setDraft({ ...draft, purchase_date: e.target.value })} className="admin-input text-xs" />
          <input type="date" value={draft.warranty_until} onChange={(e) => setDraft({ ...draft, warranty_until: e.target.value })} className="admin-input text-xs" />
          <div className="col-span-2 flex gap-2 md:col-span-5">
            <button className="rounded bg-amber px-3 py-1 text-xs font-bold text-ink">Save Unit</button>
            <button type="button" onClick={() => setAdding(false)} className="rounded border border-admin-border px-3 py-1 text-xs">Cancel</button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-xs">
          <thead className="bg-admin-surface-2/60 text-left text-[10px] uppercase tracking-wider text-admin-muted">
            <tr>
              <th className="px-2 py-2">IMEI / Serial</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Sold To</th>
              <th className="px-2 py-2">Cost ₹</th>
              <th className="px-2 py-2">Supplier</th>
              <th className="px-2 py-2">Purchased</th>
              <th className="px-2 py-2">Warranty</th>
              <th className="px-2 py-2">Notes</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {product.inventory.length === 0 ? (
              <tr><td colSpan={9} className="px-2 py-4 text-center text-admin-muted">No units. Add one above.</td></tr>
            ) : product.inventory.map((u) => (
              <UnitRow key={u.id} unit={u} onSave={(patch) => updateUnit(u.id, patch)} onDelete={() => delUnit(u.id)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UnitRow({ unit, onSave, onDelete }: { unit: InventoryUnit; onSave: (p: Partial<InventoryUnit>) => void; onDelete: () => void }) {
  const [u, setU] = useState(unit);
  const dirty = JSON.stringify(u) !== JSON.stringify(unit);
  return (
    <tr>
      <td className="px-2 py-1.5">
        <input className="admin-input h-7 font-mono text-xs" value={u.imei ?? ""} onChange={(e) => setU({ ...u, imei: e.target.value || null })} />
      </td>
      <td className="px-2 py-1.5">
        <select className="admin-input h-7 text-xs" value={u.status} onChange={(e) => setU({ ...u, status: e.target.value as UnitStatus })}>
          {UNIT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </td>
      <td className="px-2 py-1.5">
        {(() => {
          const bi = unit.bill_items?.find((b) => b.bill);
          if (!bi?.bill) return <span className="text-admin-muted">—</span>;
          return (
            <div className="text-[11px] leading-tight">
              <div className="font-mono">{bi.bill.bill_number ?? bi.bill.id.slice(0, 8)}</div>
              <div className="text-admin-muted truncate max-w-[140px]">{bi.bill.customer_name ?? "Walk-in"}</div>
            </div>
          );
        })()}
      </td>
      <td className="px-2 py-1.5">
        <input type="number" className="admin-input h-7 w-24 text-xs" value={u.cost_price ?? ""} onChange={(e) => setU({ ...u, cost_price: e.target.value === "" ? null : Number(e.target.value) })} />
      </td>
      <td className="px-2 py-1.5">
        <input className="admin-input h-7 w-32 text-xs" value={u.supplier ?? ""} onChange={(e) => setU({ ...u, supplier: e.target.value || null })} />
      </td>
      <td className="px-2 py-1.5">
        <input type="date" className="admin-input h-7 w-36 text-xs" value={u.purchase_date ?? ""} onChange={(e) => setU({ ...u, purchase_date: e.target.value || null })} />
      </td>
      <td className="px-2 py-1.5">
        <input type="date" className="admin-input h-7 w-36 text-xs" value={u.warranty_until ?? ""} onChange={(e) => setU({ ...u, warranty_until: e.target.value || null })} />
      </td>
      <td className="px-2 py-1.5">
        <input className="admin-input h-7 w-40 text-xs" value={u.notes ?? ""} onChange={(e) => setU({ ...u, notes: e.target.value || null })} />
      </td>
      <td className="px-2 py-1.5 text-right">
        <div className="flex justify-end gap-1">
          {dirty && (
            <button onClick={() => onSave(u)} className="rounded bg-amber px-2 py-1 text-[10px] font-bold text-ink">Save</button>
          )}
          <button onClick={onDelete} className="rounded text-admin-muted hover:bg-ruby/20 hover:text-ruby">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function BillsForProduct({ productId }: { productId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "product-bills", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bill_items")
        .select("id, unit_price, quantity, line_total, bill:bills(id, bill_number, customer_name, customer_phone, grand_total, status, created_at)")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="rounded-lg border border-admin-border bg-admin-surface">
      <div className="border-b border-admin-border px-3 py-2 text-xs font-bold uppercase tracking-wider text-admin-muted">
        Bills containing this product
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-xs">
          <thead className="bg-admin-surface-2/60 text-left text-[10px] uppercase tracking-wider text-admin-muted">
            <tr>
              <th className="px-2 py-2">Bill #</th>
              <th className="px-2 py-2">Customer</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2 text-right">Unit Price</th>
              <th className="px-2 py-2 text-right">Total</th>
              <th className="px-2 py-2">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-2 py-3 text-center text-admin-muted">Loading…</td></tr>
            ) : (data ?? []).length === 0 ? (
              <tr><td colSpan={6} className="px-2 py-3 text-center text-admin-muted">No bills yet.</td></tr>
            ) : (data as any[]).map((it) => (
              <tr key={it.id}>
                <td className="px-2 py-1.5 font-mono">{it.bill?.bill_number ?? "—"}</td>
                <td className="px-2 py-1.5">{it.bill?.customer_name ?? "—"} <span className="text-admin-subtle">{it.bill?.customer_phone ?? ""}</span></td>
                <td className="px-2 py-1.5"><Badge k={it.bill?.status === "PAID" ? "AVAILABLE" : "DRAFT"}>{it.bill?.status ?? "—"}</Badge></td>
                <td className="px-2 py-1.5 text-right font-num">{formatINR(it.unit_price)}</td>
                <td className="px-2 py-1.5 text-right font-num">{formatINR(it.line_total)}</td>
                <td className="px-2 py-1.5">{fmtDate(it.bill?.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Create / edit dialog ---------------- */

function ProductDialog({ product, brands, onClose, onSaved }: {
  product: ProductRow | null;
  brands: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    brand_id: product?.brand_id ?? brands[0]?.id ?? "",
    model: product?.model ?? "",
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

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const finalSlug = form.slug.trim() || slugify(form.name);
      const payload = {
        name: form.name.trim(),
        slug: finalSlug,
        brand_id: form.brand_id || null,
        model: form.model || null,
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
        const { error: invErr } = await supabase.from("inventory_units").insert({
          product_id: data.id,
          imei: form.imei.trim() || null,
          cost_price: form.cost_price === "" ? null : Number(form.cost_price),
          status: "AVAILABLE",
        });
        if (invErr) throw invErr;
        setCreatedId(data.id);
        qc.invalidateQueries({ queryKey: ["admin", "products"] });
        toast.success("Product created — add images and more units below");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/60 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="my-8 w-full max-w-4xl space-y-6 rounded-xl border border-admin-border bg-admin-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">{product || createdId ? "Edit Product" : "New Product"}</h2>
            <p className="text-xs text-admin-muted mt-0.5">Edit product details, media and IMEIs in one place.</p>
          </div>
        </div>

        {/* 1. General Information */}
        <Section title="General Information" subtitle="Core product details shown on the storefront">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
            <Field label="Model"><input value={form.model} onChange={(e) => set("model", e.target.value)} className="admin-input" /></Field>
            <Field label="Storage"><input value={form.storage} onChange={(e) => set("storage", e.target.value)} className="admin-input" placeholder="128GB" /></Field>
            <Field label="RAM"><input value={form.ram} onChange={(e) => set("ram", e.target.value)} className="admin-input" placeholder="8GB" /></Field>
            <Field label="Color"><input value={form.color} onChange={(e) => set("color", e.target.value)} className="admin-input" /></Field>
            <Field label="Condition">
              <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className="admin-input">
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </Field>
            <Field label="Selling Price (₹)">
              <input type="number" value={form.selling_price} onChange={(e) => set("selling_price", Number(e.target.value))} className="admin-input" />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Description">
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="admin-input" />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_listed} onChange={(e) => set("is_listed", e.target.checked)} /> Listed (visible on site)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Featured</label>
          </div>
        </Section>

        {/* 2. Media */}
        <Section title="Media" subtitle="Upload images / GIFs. Drag & drop or paste with Ctrl+V supported.">
          {createdId ? (
            <ProductImagesManager productId={createdId} />
          ) : (
            <p className="text-xs text-admin-muted">Save the product first to upload media.</p>
          )}
        </Section>

        {/* 3. IMEI Management */}
        <Section title="IMEI Management" subtitle="Edit, add or remove IMEIs. Unsold IMEIs can be removed; sold IMEIs are locked to preserve bill history.">
          {!createdId ? (
            <Field label="IMEI (initial unit, optional)">
              <input value={form.imei} onChange={(e) => set("imei", e.target.value)} className="admin-input font-mono" placeholder="15-digit IMEI" maxLength={20} />
            </Field>
          ) : product ? (
            <ImeiManager product={product} onChanged={() => qc.invalidateQueries({ queryKey: ["admin", "products"] })} />
          ) : (
            <p className="text-xs text-admin-muted">Save the product first to manage IMEIs.</p>
          )}
        </Section>

        <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-2 border-t border-admin-border bg-admin-surface px-6 py-3 rounded-b-xl">
          <button type="button" onClick={onClose} className="h-10 rounded-md border border-admin-border px-4 text-sm">{createdId ? "Done" : "Cancel"}</button>
          <button disabled={saving} className="h-10 rounded-md bg-amber px-5 text-sm font-bold text-ink disabled:opacity-50">{saving ? "Saving…" : createdId ? "Save Changes" : "Create Product"}</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- IMEI-only manager (Edit Product dialog) ---------------- */

function ImeiManager({ product, onChanged }: { product: ProductRow; onChanged: () => void }) {
  const qc = useQueryClient();
  const [newImei, setNewImei] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});

  const units = product.inventory;

  function imeiExists(value: string, exceptId?: string) {
    const v = value.trim().toLowerCase();
    if (!v) return false;
    return units.some((u) => u.id !== exceptId && (u.imei ?? "").trim().toLowerCase() === v);
  }

  async function saveImei(id: string) {
    const value = (edits[id] ?? "").trim();
    const unit = units.find((u) => u.id === id);
    if (!unit) return;
    if ((unit.imei ?? "") === value) { setEdits((e) => { const n = { ...e }; delete n[id]; return n; }); return; }
    if (value && imeiExists(value, id)) { toast.error("Duplicate IMEI on this product"); return; }
    const { error } = await supabase.from("inventory_units").update({ imei: value || null }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("IMEI updated");
    setEdits((e) => { const n = { ...e }; delete n[id]; return n; });
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    onChanged();
  }

  async function removeUnit(id: string, status: UnitStatus) {
    if (status === "SOLD") { toast.error("Cannot remove a sold IMEI"); return; }
    if (!confirm("Remove this IMEI / unit?")) return;
    const { error } = await supabase.from("inventory_units").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Removed");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    onChanged();
  }

  async function addImei(e: React.FormEvent) {
    e.preventDefault();
    const value = newImei.trim();
    if (value && imeiExists(value)) { toast.error("Duplicate IMEI on this product"); return; }
    const { error } = await supabase.from("inventory_units").insert({
      product_id: product.id,
      imei: value || null,
      status: "AVAILABLE",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("IMEI added");
    setNewImei("");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    onChanged();
  }

  return (
    <div className="space-y-3">
      <form onSubmit={addImei} className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[220px]">
          <Field label="Add IMEI">
            <input value={newImei} onChange={(e) => setNewImei(e.target.value)} placeholder="15-digit IMEI" maxLength={20} className="admin-input font-mono" />
          </Field>
        </div>
        <button className="h-10 rounded bg-amber px-4 text-xs font-bold text-ink">
          <Plus className="inline h-3 w-3 -mt-0.5" /> Add
        </button>
      </form>

      {units.length === 0 ? (
        <div className="rounded-md border border-dashed border-admin-border bg-admin-surface-2 p-4 text-center text-xs text-admin-muted">
          No IMEIs yet — add one above.
        </div>
      ) : (
        <ul className="divide-y divide-admin-border rounded-md border border-admin-border bg-admin-surface-2/40">
          {units.map((u) => {
            const dirty = edits[u.id] !== undefined && edits[u.id] !== (u.imei ?? "");
            const isSold = u.status === "SOLD";
            return (
              <li key={u.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                <input
                  value={edits[u.id] ?? u.imei ?? ""}
                  onChange={(e) => setEdits((s) => ({ ...s, [u.id]: e.target.value }))}
                  placeholder="IMEI"
                  maxLength={20}
                  className="admin-input h-8 flex-1 min-w-[200px] font-mono text-xs"
                />
                <Badge k={u.status} />
                {dirty && (
                  <button type="button" onClick={() => saveImei(u.id)} className="rounded bg-amber px-2 py-1 text-[10px] font-bold text-ink">Save</button>
                )}
                <button
                  type="button"
                  onClick={() => removeUnit(u.id, u.status)}
                  disabled={isSold}
                  title={isSold ? "Sold IMEIs cannot be removed" : "Remove"}
                  className="rounded p-1 text-admin-muted hover:bg-ruby/20 hover:text-ruby disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-admin-muted disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[11px] text-admin-muted">
        {product.available_count} available · {product.reserved_count} reserved · {product.sold_count} sold · {product.total_count} total
      </p>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-admin-border bg-admin-surface-2/40 p-4">
      <header className="mb-3 border-b border-admin-border pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-admin-text">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[11px] text-admin-muted">{subtitle}</p>}
      </header>
      {children}
    </section>
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
