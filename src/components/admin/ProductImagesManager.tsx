import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Star, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/integrations/supabase/client";

type Img = { id: string; url: string; is_primary: boolean; display_order: number };

const BUCKET = "product-images";

function proxyUrl(path: string) {
  // Served through our public image proxy so private buckets render for anonymous visitors.
  return `/api/public/img/${BUCKET}/${path}`;
}

export function ProductImagesManager({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const { data: images = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "product-images", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("id, url, is_primary, display_order")
        .eq("product_id", productId)
        .order("display_order")
        .order("created_at");
      if (error) throw error;
      return data as Img[];
    },
  });
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const existingCount = images.length;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${productId}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        const url = publicUrl(path);
        const { error: insErr } = await supabase.from("product_images").insert({
          product_id: productId,
          url,
          is_primary: existingCount === 0 && i === 0,
          display_order: existingCount + i,
        });
        if (insErr) throw insErr;
      }
      toast.success("Image(s) uploaded");
      await refetch();
      qc.invalidateQueries({ queryKey: ["products", "all"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const setPrimary = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
      const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      qc.invalidateQueries({ queryKey: ["products", "all"] });
    },
  });

  const del = useMutation({
    mutationFn: async (img: Img) => {
      // Best-effort delete storage file if from our bucket
      const marker = `/${BUCKET}/`;
      const idx = img.url.indexOf(marker);
      if (idx > -1) {
        const path = img.url.substring(idx + marker.length).split("?")[0];
        await supabase.storage.from(BUCKET).remove([path]);
      }
      const { error } = await supabase.from("product_images").delete().eq("id", img.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      refetch();
      qc.invalidateQueries({ queryKey: ["products", "all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-admin-muted">Images</span>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface-2 px-3 py-1.5 text-xs font-semibold text-admin-text hover:border-amber/50">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>
      {isLoading ? (
        <div className="text-xs text-admin-muted">Loading…</div>
      ) : images.length === 0 ? (
        <div className="rounded-md border border-dashed border-admin-border bg-admin-surface-2 p-4 text-center text-xs text-admin-muted">
          No images yet — upload one or more.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md border border-admin-border bg-admin-surface-2">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              {img.is_primary && (
                <span className="absolute left-1 top-1 rounded bg-amber px-1.5 py-0.5 text-[9px] font-bold text-ink">
                  Primary
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary.mutate(img.id)}
                    className="rounded bg-amber p-1.5 text-ink"
                    title="Set primary"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => del.mutate(img)}
                  className="rounded bg-ruby p-1.5 text-white"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Pre-create upload helper for new products (returns false until id available)
export function useImagesHint() {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    setSeen(true);
  }, []);
  return seen;
}
