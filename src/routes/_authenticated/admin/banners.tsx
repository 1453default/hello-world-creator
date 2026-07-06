import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Pencil, Trash2, Plus, Eye, EyeOff, Upload, Loader2, ExternalLink, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";
import { BANNER_BUCKET, bannerImageRef, type PromoBanner } from "@/lib/banners";
import { useSignedImageUrl } from "@/hooks/useSignedImageUrl";

function BannerThumb({ path, alt }: { path: string; alt: string }) {
  const url = useSignedImageUrl(bannerImageRef(path));
  return <img src={url} alt={alt} className="h-full w-full object-cover" loading="lazy" />;
}

export const Route = createFileRoute("/_authenticated/admin/banners")({
  head: () => ({ meta: [{ title: "Promotional Banners · Admin" }] }),
  component: BannersPage,
});

function BannersPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<PromoBanner | null>(null);
  const [open, setOpen] = useState(false);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin", "promo_banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PromoBanner[];
    },
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["admin", "promo_banners"] });
    qc.invalidateQueries({ queryKey: ["promo-banners", "active"] });
  };

  const del = useMutation({
    mutationFn: async (b: PromoBanner) => {
      // Try to remove image file; ignore errors so DB row still deletes cleanly.
      await supabase.storage.from(BANNER_BUCKET).remove([b.image_path]).catch(() => null);
      const { error } = await supabase.from("promo_banners").delete().eq("id", b.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Banner deleted"); invalidateAll(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async (b: PromoBanner) => {
      const { error } = await supabase
        .from("promo_banners")
        .update({ is_active: !b.is_active })
        .eq("id", b.id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-admin-muted">Marketing</div>
          <h1 className="font-display text-2xl font-bold">Promotional Banners</h1>
          <p className="text-sm text-admin-muted">Manage the promotional slider shown on the homepage.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-amber px-4 text-sm font-bold text-ink hover:bg-amber-dark"
        >
          <Plus className="h-4 w-4" /> New Banner
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
        {isLoading ? (
          <div className="p-8 text-center text-admin-muted">Loading…</div>
        ) : banners.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-admin-surface-2 text-admin-muted">
              <ImageIcon className="h-6 w-6" />
            </div>
            <p className="mt-3 font-semibold">No banners yet</p>
            <p className="text-sm text-admin-muted">Create your first promotional banner to show it on the homepage.</p>
          </div>
        ) : (
          <ul className="divide-y divide-admin-border">
            {banners.map((b) => (
              <li key={b.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-admin-surface-2">
                  <BannerThumb path={b.image_path} alt={b.heading ?? "Banner"} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${b.is_active ? "bg-emerald/20 text-emerald" : "bg-admin-surface-2 text-admin-muted"}`}>
                      {b.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-admin-muted">Order {b.display_order}</span>
                  </div>
                  <div className="mt-1 truncate font-display font-bold">{b.heading || <span className="text-admin-muted">Untitled</span>}</div>
                  {b.subheading && <div className="mt-0.5 truncate text-sm text-admin-muted">{b.subheading}</div>}
                  {b.button_link && (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-admin-muted">
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate">{b.button_text || "Link"} → {b.button_link}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <button
                    onClick={() => toggleActive.mutate(b)}
                    className={`inline-flex h-9 items-center gap-1 rounded-md px-3 text-xs font-semibold ${b.is_active ? "bg-emerald/15 text-emerald hover:bg-emerald/25" : "bg-admin-surface-2 text-admin-muted hover:bg-admin-surface"}`}
                  >
                    {b.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {b.is_active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => { setEditing(b); setOpen(true); }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text"
                    aria-label="Edit banner"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => confirm("Delete this banner?") && del.mutate(b)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded text-admin-muted hover:bg-ruby/20 hover:text-ruby"
                    aria-label="Delete banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <BannerDialog
          banner={editing}
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); invalidateAll(); }}
        />
      )}
    </div>
  );
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function BannerDialog({
  banner,
  onClose,
  onSaved,
}: {
  banner: PromoBanner | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [heading, setHeading] = useState(banner?.heading ?? "");
  const [subheading, setSubheading] = useState(banner?.subheading ?? "");
  const [buttonText, setButtonText] = useState(banner?.button_text ?? "");
  const [buttonLink, setButtonLink] = useState(banner?.button_link ?? "");
  const [isActive, setIsActive] = useState(banner?.is_active ?? true);
  const [order, setOrder] = useState(banner?.display_order ?? 0);
  const [imagePath, setImagePath] = useState(banner?.image_path ?? "");
  const [preview, setPreview] = useState<string | null>(banner ? bannerImageUrl(banner.image_path) : null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, WebP or AVIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image is too large (max 8 MB).");
      return;
    }
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from(BANNER_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      // Remove previous unsaved upload if user re-uploaded before saving
      if (imagePath && imagePath !== banner?.image_path) {
        await supabase.storage.from(BANNER_BUCKET).remove([imagePath]).catch(() => null);
      }
      setImagePath(path);
      setPreview(bannerImageUrl(path));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!imagePath) {
      toast.error("Please upload a banner image.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        image_path: imagePath,
        heading: heading.trim() || null,
        subheading: subheading.trim() || null,
        button_text: buttonText.trim() || null,
        button_link: buttonLink.trim() || null,
        is_active: isActive,
        display_order: order,
      };
      const { error } = banner
        ? await supabase.from("promo_banners").update(payload).eq("id", banner.id)
        : await supabase.from("promo_banners").insert(payload);
      if (error) throw error;
      // If replacing an image on an existing banner, delete the old file
      if (banner && banner.image_path !== imagePath) {
        await supabase.storage.from(BANNER_BUCKET).remove([banner.image_path]).catch(() => null);
      }
      toast.success(banner ? "Banner updated" : "Banner created");
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
        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl border border-admin-border bg-admin-surface p-6"
      >
        <h2 className="font-display text-lg font-bold">{banner ? "Edit" : "New"} Promotional Banner</h2>

        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted">Banner Image</span>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-admin-border bg-admin-surface-2">
            {preview ? (
              <img src={preview} alt="Banner preview" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-admin-muted">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-8 w-8" />
                  <p className="mt-2 text-xs">No image yet</p>
                </div>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-black/60">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.currentTarget.value = ""; }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-2 inline-flex h-9 items-center gap-2 rounded-md border border-admin-border px-3 text-xs font-semibold hover:bg-admin-surface-2 disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" /> {preview ? "Replace image" : "Upload image"}
          </button>
          <p className="mt-1 text-[11px] text-admin-muted">JPG, PNG, WebP or AVIF · up to 8 MB · Landscape (16:9) works best.</p>
        </div>

        <Field label="Heading">
          <input value={heading} onChange={(e) => setHeading(e.target.value)} maxLength={80} className="admin-input" placeholder="e.g. iPhone 13 · Diwali Special" />
        </Field>
        <Field label="Sub Heading">
          <input value={subheading} onChange={(e) => setSubheading(e.target.value)} maxLength={140} className="admin-input" placeholder="e.g. Grade A+ · 6 month warranty" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Button Text">
            <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} maxLength={30} className="admin-input" placeholder="Shop Now" />
          </Field>
          <Field label="Button Link (optional)">
            <input value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} maxLength={300} className="admin-input" placeholder="/catalog or https://…" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Display Order">
            <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="admin-input" />
          </Field>
          <label className="flex items-end gap-2 pb-1 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (show on homepage)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-admin-border px-4 text-sm">Cancel</button>
          <button disabled={saving || uploading} className="h-9 rounded-md bg-amber px-4 text-sm font-bold text-ink disabled:opacity-50">
            {saving ? "Saving…" : "Save Banner"}
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
