import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_featured: boolean;
  display_order: number;
};

export type ProductImage = { url: string; is_primary: boolean; display_order: number };

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  storage: string | null;
  ram: string | null;
  color: string | null;
  condition: string;
  selling_price: number;
  is_featured: boolean;
  created_at: string;
  brand: { name: string; slug: string } | null;
  images: ProductImage[];
  available_count: number;
  sold_count: number;
};

const PRODUCT_SELECT = `
  id, name, slug, storage, ram, color, condition, selling_price, is_featured, created_at,
  brand:brands ( name, slug ),
  images:product_images ( url, is_primary, display_order ),
  inventory:inventory_units ( id, status )
`;

/**
 * Extract { bucket, path } from any of our stored URL formats.
 *  - /api/public/img/<bucket>/<path>            (legacy SSR proxy form — fails on Vercel static)
 *  - https://*.supabase.co/storage/v1/object/{public|sign|authenticated}/<bucket>/<path>
 *  - <bucket>::<path>                            (new compact form, future-proof)
 */
function parseStorageRef(url: string | null | undefined): { bucket: string; path: string } | null {
  if (!url) return null;
  const proxy = url.match(/^\/api\/public\/img\/([^/]+)\/(.+)$/);
  if (proxy) return { bucket: proxy[1], path: proxy[2].split("?")[0] };
  const storage = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/([^?]+)/);
  if (storage) return { bucket: storage[1], path: storage[2] };
  const compact = url.match(/^([a-z0-9_-]+)::(.+)$/i);
  if (compact) return { bucket: compact[1], path: compact[2] };
  return null;
}

/** Synchronous best-effort URL (used as a fallback / before signing). Empty string → placeholder. */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  // Legacy proxy form still works on Lovable runtime; on Vercel static it 404s.
  return url;
}

/** Sign a single stored URL → CDN-served signed URL. Returns original if it's already an external https URL. */
async function signImageUrl(url: string): Promise<string> {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) && !/\/storage\/v1\/object\//.test(url)) return url;
  const ref = parseStorageRef(url);
  if (!ref) return url;
  const { data, error } = await supabase.storage
    .from(ref.bucket)
    .createSignedUrl(ref.path, 60 * 60 * 6);
  if (error || !data?.signedUrl) return "";
  return data.signedUrl;
}

export async function signImageList<T extends { url: string }>(images: T[]): Promise<T[]> {
  if (!images || images.length === 0) return images;
  // Group by bucket → one createSignedUrls() request per bucket instead of N.
  const refs = images.map((img) => ({ img, ref: parseStorageRef(img.url) }));
  const byBucket = new Map<string, string[]>();
  for (const { ref } of refs) {
    if (!ref) continue;
    const list = byBucket.get(ref.bucket) ?? [];
    list.push(ref.path);
    byBucket.set(ref.bucket, list);
  }
  const signed = new Map<string, string>(); // key = bucket + "::" + path
  await Promise.all(
    Array.from(byBucket.entries()).map(async ([bucket, paths]) => {
      const unique = Array.from(new Set(paths));
      const { data, error } = await supabase.storage.from(bucket).createSignedUrls(unique, 60 * 60 * 6);
      if (error || !data) return;
      for (const row of data) {
        if (row.path && row.signedUrl) signed.set(`${bucket}::${row.path}`, row.signedUrl);
      }
    }),
  );
  return refs.map(({ img, ref }) => {
    if (!ref) {
      // Fallback: pass-through for external/unknown URLs
      if (/^https?:\/\//i.test(img.url)) return img;
      return { ...img, url: "" };
    }
    return { ...img, url: signed.get(`${ref.bucket}::${ref.path}`) ?? "" };
  });
}

async function shapeProduct(row: any): Promise<ProductCard & { sold_count: number }> {
  const inv = (row.inventory ?? []) as { status: string }[];
  const available_count = inv.filter((u) => u.status === "AVAILABLE").length;
  const sold_count = inv.filter((u) => u.status === "SOLD").length;
  const sortedImages = ((row.images ?? []) as ProductImage[]).sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order,
  );
  return {
    ...row,
    selling_price: Number(row.selling_price),
    images: sortedImages,
    available_count,
    sold_count,
  };
}

export const brandsQuery = queryOptions({
  queryKey: ["brands"],
  queryFn: async (): Promise<Brand[]> => {
    const { data, error } = await supabase
      .from("brands")
      .select("id,name,slug,logo_url,is_featured,display_order")
      .eq("is_visible", true)
      .order("display_order");
    if (error) throw error;
    return data as Brand[];
  },
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
});

export const allProductsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: async (): Promise<ProductCard[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_listed", true)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const shaped = await Promise.all((data ?? []).map(shapeProduct));
    // Batch-sign every product image in one request per bucket.
    const allImages = shaped.flatMap((p) => p.images);
    const signedFlat = await signImageList(allImages);
    let i = 0;
    for (const p of shaped) {
      p.images = signedFlat.slice(i, i + p.images.length);
      i += p.images.length;
    }
    return shaped.sort((a, b) => {
      const aSold = a.available_count === 0 ? 1 : 0;
      const bSold = b.available_count === 0 ? 1 : 0;
      return aSold - bSold;
    });
  },
  staleTime: 2 * 60_000,
  gcTime: 30 * 60_000,
});



export const productBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<ProductCard | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT + ", description, model, category")
        .eq("slug", slug)
        .eq("is_listed", true)
        .eq("is_deleted", false)
        .maybeSingle();
      if (error) throw error;
      return data ? ((await shapeProduct(data)) as unknown as ProductCard & { description: string }) : null;
    },
  });
