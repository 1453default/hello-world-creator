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
  brand:brands ( name, slug, display_order ),
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
  return url;
}

/**
 * Return browser-loadable storage URLs for every stored image reference.
 * This intentionally signs directly through the publishable storage client so
 * Vercel/static deployments do not depend on the app server route being
 * available for image bytes.
 */
export async function signImageList<T extends { url: string }>(images: T[]): Promise<T[]> {
  if (!images || images.length === 0) return images;
  const refs = images.map((img) => ({ img, ref: parseStorageRef(img.url) }));
  const byBucket = new Map<string, string[]>();

  for (const { ref } of refs) {
    if (!ref) continue;
    const list = byBucket.get(ref.bucket) ?? [];
    list.push(ref.path);
    byBucket.set(ref.bucket, list);
  }

  const signed = new Map<string, string>();
  await Promise.all(
    Array.from(byBucket.entries()).map(async ([bucket, paths]) => {
      const unique = Array.from(new Set(paths));
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrls(unique, 60 * 60 * 6);
      if (error || !data) return;
      for (const row of data) {
        if (row.path && row.signedUrl) signed.set(`${bucket}::${row.path}`, row.signedUrl);
      }
    }),
  );

  return refs.map(({ img, ref }) => {
    if (!ref) {
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
      // 1) Available before sold-out
      const aSold = a.available_count === 0 ? 1 : 0;
      const bSold = b.available_count === 0 ? 1 : 0;
      if (aSold !== bSold) return aSold - bSold;
      // 2) Brand display_order (asc) — groups products by brand
      const aBrandOrder = (a.brand as any)?.display_order ?? 9999;
      const bBrandOrder = (b.brand as any)?.display_order ?? 9999;
      if (aBrandOrder !== bBrandOrder) return aBrandOrder - bBrandOrder;
      // 3) Brand name alpha (stable when display_order equal)
      const aBrandName = a.brand?.name ?? "";
      const bBrandName = b.brand?.name ?? "";
      if (aBrandName !== bBrandName) return aBrandName.localeCompare(bBrandName);
      // 4) Price high → low (premium first within each brand)
      if (b.selling_price !== a.selling_price) return b.selling_price - a.selling_price;
      // 5) Newest first on ties
      return +new Date(b.created_at) - +new Date(a.created_at);
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
      if (!data) return null;
      const shaped = await shapeProduct(data);
      shaped.images = await signImageList(shaped.images);
      return shaped as unknown as ProductCard & { description: string };
    },
    staleTime: 2 * 60_000,
    gcTime: 30 * 60_000,
  });

export type RecentlySoldCard = {
  id: string;
  name: string;
  slug: string;
  storage: string | null;
  ram: string | null;
  color: string | null;
  condition: string;
  brand: { name: string; slug: string } | null;
  images: ProductImage[];
  sold_at: string;
};

export const recentlySoldQuery = queryOptions({
  queryKey: ["products", "recently-sold"],
  queryFn: async (): Promise<RecentlySoldCard[]> => {
    // Read configurable window (days). Default 7.
    let days = 7;
    try {
      const { data: setting } = await supabase
        .from("shop_settings")
        .select("value")
        .eq("key", "recently_sold_days")
        .maybeSingle();
      const parsed = setting?.value ? parseInt(setting.value, 10) : NaN;
      if (Number.isFinite(parsed) && parsed > 0) days = parsed;
    } catch {
      /* keep default */
    }
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Pull recently-sold units with the parent product (ignores is_listed so
    // auto-unlisted sold products still appear here, but not in the catalog).
    const { data, error } = await supabase
      .from("inventory_units")
      .select(
        `sold_at, product:products!inner (
          id, name, slug, storage, ram, color, condition, is_deleted,
          brand:brands ( name, slug ),
          images:product_images ( url, is_primary, display_order )
        )`,
      )
      .eq("status", "SOLD")
      .gte("sold_at", since)
      .order("sold_at", { ascending: false })
      .limit(50);
    if (error) throw error;

    // Dedupe by product id, keep most recent sold_at, skip deleted products.
    const seen = new Map<string, RecentlySoldCard>();
    for (const row of (data ?? []) as any[]) {
      const p = row.product;
      if (!p || p.is_deleted) continue;
      if (seen.has(p.id)) continue;
      const sortedImages = ((p.images ?? []) as ProductImage[]).sort(
        (a, b) =>
          Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order,
      );
      seen.set(p.id, {
        id: p.id,
        name: p.name,
        slug: p.slug,
        storage: p.storage,
        ram: p.ram,
        color: p.color,
        condition: p.condition,
        brand: p.brand,
        images: sortedImages,
        sold_at: row.sold_at,
      });
      if (seen.size >= 10) break;
    }
    const list = Array.from(seen.values());
    const allImages = list.flatMap((p) => p.images);
    const signedFlat = await signImageList(allImages);
    let i = 0;
    for (const p of list) {
      p.images = signedFlat.slice(i, i + p.images.length);
      i += p.images.length;
    }
    return list;
  },
  staleTime: 2 * 60_000,
  gcTime: 30 * 60_000,
});

