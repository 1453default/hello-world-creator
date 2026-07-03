import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, Wand2, RotateCcw, Undo2, ImageOff, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { useSignedImageUrl } from "@/hooks/useSignedImageUrl";
import {
  listWhiteBgImages,
  processImageWhiteBg,
  approveImageWhiteBg,
  rejectImageWhiteBg,
  revertImageWhiteBg,
  type WhiteBgImageRow,
} from "@/lib/image-white-bg.functions";

export const Route = createFileRoute("/_authenticated/admin/image-tools")({
  head: () => ({ meta: [{ title: "Image Tools · Admin" }] }),
  component: ImageToolsPage,
});

type StatusFilter = "all" | "none" | "processing" | "ready" | "approved" | "failed";

const STATUS_LABEL: Record<string, string> = {
  processing: "Processing",
  ready: "Ready to review",
  approved: "Approved (live)",
  failed: "Failed",
};

const STATUS_TONE: Record<string, string> = {
  processing: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  ready: "bg-amber/15 text-amber border-amber/40",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  failed: "bg-ruby/15 text-ruby border-ruby/40",
};

const CONCURRENCY = 3;

function ImageToolsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [brandSlug, setBrandSlug] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ total: 0, done: 0, ok: 0, failed: 0, skipped: 0 });

  const query = useQuery({
    queryKey: ["admin", "white-bg-images", statusFilter, brandSlug],
    queryFn: () => listWhiteBgImages({ data: { statusFilter, brandSlug: brandSlug || undefined } }),
  });

  const rows: WhiteBgImageRow[] = query.data ?? [];

  const brandOptions = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((r) => {
      const b = r.product?.brand;
      if (b?.slug) map.set(b.slug, b.name);
    });
    return Array.from(map, ([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const grouped = useMemo(() => {
    const g = new Map<string, { product: WhiteBgImageRow["product"]; images: WhiteBgImageRow[] }>();
    for (const r of rows) {
      if (!r.product) continue;
      const bucket = g.get(r.product.id) ?? { product: r.product, images: [] };
      bucket.images.push(r);
      g.set(r.product.id, bucket);
    }
    return Array.from(g.values()).sort((a, b) => {
      const ba = a.product?.brand?.name ?? "";
      const bb = b.product?.brand?.name ?? "";
      return ba.localeCompare(bb) || (a.product?.name ?? "").localeCompare(b.product?.name ?? "");
    });
  }, [rows]);

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(rows.map((r) => r.id)));
  }

  function selectUnprocessed() {
    setSelected(new Set(rows.filter((r) => r.white_bg_status !== "approved" && r.white_bg_status !== "ready").map((r) => r.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  const approveMut = useMutation({
    mutationFn: (imageId: string) => approveImageWhiteBg({ data: { imageId } }),
    onSuccess: () => {
      toast.success("Applied to public site");
      qc.invalidateQueries({ queryKey: ["admin", "white-bg-images"] });
      qc.invalidateQueries({ queryKey: ["products", "all"] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMut = useMutation({
    mutationFn: (imageId: string) => rejectImageWhiteBg({ data: { imageId } }),
    onSuccess: () => {
      toast.success("Discarded");
      qc.invalidateQueries({ queryKey: ["admin", "white-bg-images"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revertMut = useMutation({
    mutationFn: (imageId: string) => revertImageWhiteBg({ data: { imageId } }),
    onSuccess: () => {
      toast.success("Reverted to original");
      qc.invalidateQueries({ queryKey: ["admin", "white-bg-images"] });
      qc.invalidateQueries({ queryKey: ["products", "all"] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function runBatch(ids: string[], force = false) {
    if (ids.length === 0) {
      toast.error("Select at least one image.");
      return;
    }
    setRunning(true);
    setProgress({ total: ids.length, done: 0, ok: 0, failed: 0, skipped: 0 });
    const queue = [...ids];
    async function worker() {
      while (queue.length) {
        const id = queue.shift()!;
        try {
          const r = await processImageWhiteBg({ data: { imageId: id, force } });
          setProgress((p) => ({
            ...p,
            done: p.done + 1,
            ok: r.status === "ready" || r.status === "approved" ? p.ok + 1 : p.ok,
            failed: r.status === "failed" ? p.failed + 1 : p.failed,
            skipped: r.skipped ? p.skipped + 1 : p.skipped,
          }));
        } catch (e) {
          setProgress((p) => ({ ...p, done: p.done + 1, failed: p.failed + 1 }));
          console.error("[white-bg]", (e as Error).message);
        }
      }
    }
    const workers = Array.from({ length: Math.min(CONCURRENCY, ids.length) }, worker);
    await Promise.all(workers);
    setRunning(false);
    await qc.invalidateQueries({ queryKey: ["admin", "white-bg-images"] });
    toast.success("Batch complete");
  }

  async function approveAllReady() {
    const readyIds = rows.filter((r) => r.white_bg_status === "ready").map((r) => r.id);
    if (!readyIds.length) return toast.error("No ready variants to approve.");
    if (!confirm(`Apply ${readyIds.length} white-background images to the public site?`)) return;
    let ok = 0;
    for (const id of readyIds) {
      try { await approveImageWhiteBg({ data: { imageId: id } }); ok++; } catch { /* ignore */ }
    }
    toast.success(`Applied ${ok}/${readyIds.length}`);
    qc.invalidateQueries({ queryKey: ["admin", "white-bg-images"] });
    qc.invalidateQueries({ queryKey: ["products", "all"] });
  }

  const counts = useMemo(() => {
    const c = { total: rows.length, none: 0, processing: 0, ready: 0, approved: 0, failed: 0 };
    rows.forEach((r) => {
      const k = (r.white_bg_status ?? "none") as keyof typeof c;
      if (k in c) (c as any)[k] += 1;
    });
    return c;
  }, [rows]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-admin-text">White-Background Image Tool</h1>
        <p className="max-w-3xl text-sm text-admin-muted">
          Generate clean, pure-white-background versions of existing product photos in bulk. Originals are preserved
          as a backup; you can approve, reject, or revert at any time without breaking the public site.
        </p>
      </header>

      {/* Stats + filters */}
      <div className="grid gap-3 rounded-lg border border-admin-border bg-admin-surface p-4 md:grid-cols-6">
        <Stat label="Total" value={counts.total} />
        <Stat label="Unprocessed" value={counts.none} tone="text-admin-muted" />
        <Stat label="Processing" value={counts.processing} tone="text-blue-300" />
        <Stat label="Ready" value={counts.ready} tone="text-amber" />
        <Stat label="Approved" value={counts.approved} tone="text-emerald-300" />
        <Stat label="Failed" value={counts.failed} tone="text-ruby" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-admin-border bg-admin-surface p-3">
        <Filter className="h-4 w-4 text-admin-muted" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-md border border-admin-border bg-admin-surface-2 px-3 py-1.5 text-sm text-admin-text"
        >
          <option value="all">All statuses</option>
          <option value="none">Unprocessed</option>
          <option value="processing">Processing</option>
          <option value="ready">Ready to review</option>
          <option value="approved">Approved (live)</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={brandSlug}
          onChange={(e) => setBrandSlug(e.target.value)}
          className="rounded-md border border-admin-border bg-admin-surface-2 px-3 py-1.5 text-sm text-admin-text"
        >
          <option value="">All brands</option>
          {brandOptions.map((b) => (
            <option key={b.slug} value={b.slug}>{b.name}</option>
          ))}
        </select>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button onClick={selectUnprocessed} className="rounded-md border border-admin-border bg-admin-surface-2 px-3 py-1.5 text-xs font-semibold text-admin-text hover:border-amber/50">
            Select unprocessed
          </button>
          <button onClick={selectAllVisible} className="rounded-md border border-admin-border bg-admin-surface-2 px-3 py-1.5 text-xs font-semibold text-admin-text hover:border-amber/50">
            Select all visible ({rows.length})
          </button>
          <button onClick={clearSelection} className="rounded-md border border-admin-border bg-admin-surface-2 px-3 py-1.5 text-xs font-semibold text-admin-muted hover:text-admin-text">
            Clear
          </button>
        </div>
      </div>

      {/* Action bar */}
      <div className="sticky top-2 z-20 flex flex-wrap items-center gap-3 rounded-lg border border-admin-border bg-admin-surface p-3 shadow-lg">
        <span className="text-sm font-semibold text-admin-text">{selected.size} selected</span>
        <button
          onClick={() => runBatch(Array.from(selected), false)}
          disabled={running || selected.size === 0}
          className="inline-flex items-center gap-2 rounded-md bg-amber px-3 py-2 text-sm font-bold text-ink disabled:opacity-50"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {running ? "Processing…" : "Generate white-bg"}
        </button>
        <button
          onClick={() => runBatch(Array.from(selected), true)}
          disabled={running || selected.size === 0}
          className="inline-flex items-center gap-2 rounded-md border border-admin-border bg-admin-surface-2 px-3 py-2 text-sm font-semibold text-admin-text disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" /> Re-run (force)
        </button>
        <button
          onClick={approveAllReady}
          disabled={running || counts.ready === 0}
          className="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" /> Approve all ready ({counts.ready})
        </button>
        {running && (
          <div className="ml-auto flex items-center gap-3 text-xs text-admin-muted">
            <div className="h-2 w-40 overflow-hidden rounded-full bg-admin-surface-2">
              <div
                className="h-full bg-amber transition-all"
                style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
              />
            </div>
            <span>{progress.done}/{progress.total} · ✓{progress.ok} ✗{progress.failed} ↷{progress.skipped}</span>
          </div>
        )}
      </div>

      {query.isLoading ? (
        <div className="rounded-lg border border-admin-border bg-admin-surface p-8 text-center text-sm text-admin-muted">Loading images…</div>
      ) : grouped.length === 0 ? (
        <div className="rounded-lg border border-admin-border bg-admin-surface p-8 text-center text-sm text-admin-muted">No images match the current filter.</div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <ProductGroup
              key={group.product!.id}
              product={group.product!}
              images={group.images}
              selected={selected}
              onToggle={toggle}
              onApprove={(id) => approveMut.mutate(id)}
              onReject={(id) => rejectMut.mutate(id)}
              onRevert={(id) => revertMut.mutate(id)}
              onProcess={(id) => runBatch([id], false)}
              onReprocess={(id) => runBatch([id], true)}
              disabled={running}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = "text-admin-text" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-md bg-admin-surface-2 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-admin-muted">{label}</div>
      <div className={`font-num text-xl font-bold ${tone}`}>{value}</div>
    </div>
  );
}

function ProductGroup({
  product,
  images,
  selected,
  onToggle,
  onApprove,
  onReject,
  onRevert,
  onProcess,
  onReprocess,
  disabled,
}: {
  product: NonNullable<WhiteBgImageRow["product"]>;
  images: WhiteBgImageRow[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRevert: (id: string) => void;
  onProcess: (id: string) => void;
  onReprocess: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <section className="rounded-lg border border-admin-border bg-admin-surface p-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-admin-muted">{product.brand?.name ?? "—"}</div>
          <div className="font-display font-semibold text-admin-text">{product.name}</div>
        </div>
        <div className="text-xs text-admin-muted">{images.length} image{images.length === 1 ? "" : "s"}</div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((img) => (
          <ImageCard
            key={img.id}
            img={img}
            selected={selected.has(img.id)}
            onToggle={() => onToggle(img.id)}
            onApprove={() => onApprove(img.id)}
            onReject={() => onReject(img.id)}
            onRevert={() => onRevert(img.id)}
            onProcess={() => onProcess(img.id)}
            onReprocess={() => onReprocess(img.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
}

function ImageCard({
  img,
  selected,
  onToggle,
  onApprove,
  onReject,
  onRevert,
  onProcess,
  onReprocess,
  disabled,
}: {
  img: WhiteBgImageRow;
  selected: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRevert: () => void;
  onProcess: () => void;
  onReprocess: () => void;
  disabled: boolean;
}) {
  const status = img.white_bg_status;
  const originalUrl = useSignedImageUrl(img.original_url ?? img.url);
  const whiteBgUrl = useSignedImageUrl(img.white_bg_url);
  const liveUrl = useSignedImageUrl(img.url);
  const isApproved = status === "approved";

  return (
    <div className={`rounded-lg border ${selected ? "border-amber" : "border-admin-border"} bg-admin-surface-2 p-3`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-admin-text">
          <input type="checkbox" checked={selected} onChange={onToggle} className="h-4 w-4 accent-amber" />
          {img.is_primary ? <span className="rounded bg-amber px-1.5 py-0.5 text-[9px] font-bold text-ink">Primary</span> : null}
        </label>
        {status ? (
          <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${STATUS_TONE[status] ?? ""}`}>
            {STATUS_LABEL[status] ?? status}
          </span>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-admin-muted">Not processed</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Panel label="Original" url={originalUrl} />
        <Panel label={isApproved ? "Live (white bg)" : "White-bg preview"} url={isApproved ? liveUrl : whiteBgUrl} white />
      </div>

      {img.white_bg_error && (
        <div className="mt-2 rounded border border-ruby/40 bg-ruby/10 p-2 text-[11px] text-ruby">
          {img.white_bg_error}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {status === "ready" && (
          <>
            <button disabled={disabled} onClick={onApprove} className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 disabled:opacity-50">
              <CheckCircle2 className="h-3.5 w-3.5" /> Apply
            </button>
            <button disabled={disabled} onClick={onReject} className="inline-flex items-center gap-1 rounded-md border border-admin-border bg-admin-surface px-2.5 py-1.5 text-xs font-semibold text-admin-muted hover:text-admin-text disabled:opacity-50">
              <XCircle className="h-3.5 w-3.5" /> Discard
            </button>
            <button disabled={disabled} onClick={onReprocess} className="inline-flex items-center gap-1 rounded-md border border-admin-border bg-admin-surface px-2.5 py-1.5 text-xs font-semibold text-admin-text disabled:opacity-50">
              <RotateCcw className="h-3.5 w-3.5" /> Re-run
            </button>
          </>
        )}
        {status === "approved" && (
          <button disabled={disabled} onClick={onRevert} className="inline-flex items-center gap-1 rounded-md border border-admin-border bg-admin-surface px-2.5 py-1.5 text-xs font-semibold text-admin-text disabled:opacity-50">
            <Undo2 className="h-3.5 w-3.5" /> Revert to original
          </button>
        )}
        {(status === "failed" || status === null || status === undefined) && (
          <button disabled={disabled} onClick={onProcess} className="inline-flex items-center gap-1 rounded-md bg-amber px-2.5 py-1.5 text-xs font-bold text-ink disabled:opacity-50">
            <Wand2 className="h-3.5 w-3.5" /> {status === "failed" ? "Retry" : "Generate"}
          </button>
        )}
      </div>
    </div>
  );
}

function Panel({ label, url, white = false }: { label: string; url: string; white?: boolean }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-admin-muted">{label}</div>
      <div className={`flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md border border-admin-border ${white ? "bg-white" : "bg-admin-surface"}`}>
        {url ? (
          <img src={url} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-admin-muted">
            <ImageOff className="h-5 w-5" />
            <span className="text-[10px]">Not available</span>
          </div>
        )}
      </div>
    </div>
  );
}
