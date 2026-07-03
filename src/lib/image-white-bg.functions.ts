/**
 * Bulk white-background image conversion pipeline.
 *
 * All originals stay intact:
 *   - `original_url` holds the pre-processing URL after the first successful approval.
 *   - `white_bg_url` holds the generated variant; it is written to a separate storage path
 *     under `<productId>/wb/<imageId>.png` so the original object is never overwritten.
 *   - `url` (used by the public site) is only swapped on explicit admin approval.
 *
 * Uses the Gemini image-editing model (nano-banana) via GEMINI_API_KEY directly, matching
 * the AI product scan integration. No dependency on LOVABLE_API_KEY.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "product-images";
const GEMINI_IMAGE_MODELS = ["gemini-2.5-flash-image", "gemini-2.5-flash-image-preview"];

const EDIT_PROMPT = `Task: Replace the entire background of this product photo with a pure solid white background (#FFFFFF).

Strict requirements:
- Keep the product (a smartphone or mobile accessory) 100% intact — do not crop, distort, rotate, upscale, downscale, recolor, or add reflections.
- Preserve the original perspective, framing, and product proportions exactly.
- Remove ALL background pixels — including surfaces, hands, textures, gradients, logos, other objects, and any tinting.
- The final background must be a uniform pure white (#FFFFFF) with clean, anti-aliased edges around the product.
- A very subtle contact shadow directly beneath the product is allowed but not required. No harsh shadows, no colored shadows, no drop shadows floating around the product.
- Output a single high-resolution image with the product centered and fully visible. No text, no watermark, no border.`;

function assertAdmin(ctx: { supabase: any; userId: string }) {
  return ctx.supabase
    .rpc("has_role", { _user_id: ctx.userId, _role: "admin" })
    .then(({ data, error }: any) => {
      if (error) throw new Error(error.message);
      if (!data) throw new Error("Forbidden: admin role required");
    });
}

function parseStorageRef(url: string): { bucket: string; path: string } | null {
  if (!url) return null;
  const proxy = url.match(/^\/api\/public\/img\/([^/]+)\/(.+)$/);
  if (proxy) return { bucket: proxy[1], path: proxy[2].split("?")[0] };
  const storage = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/([^?]+)/);
  if (storage) return { bucket: storage[1], path: storage[2] };
  const compact = url.match(/^([a-z0-9_-]+)::(.+)$/i);
  if (compact) return { bucket: compact[1], path: compact[2] };
  return null;
}

async function downloadImageBytes(supabase: any, url: string): Promise<{ bytes: Uint8Array; mime: string }> {
  const ref = parseStorageRef(url);
  if (ref) {
    const { data, error } = await supabase.storage.from(ref.bucket).download(ref.path);
    if (error || !data) throw new Error(`Storage download failed: ${error?.message || "no data"}`);
    const buf = new Uint8Array(await data.arrayBuffer());
    const mime = (data as Blob).type || guessMime(ref.path);
    return { bytes: buf, mime };
  }
  if (/^https?:\/\//i.test(url)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
    const mime = res.headers.get("content-type") || "image/jpeg";
    const buf = new Uint8Array(await res.arrayBuffer());
    return { bytes: buf, mime };
  }
  throw new Error("Unrecognised image URL format");
}

function guessMime(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
}

function toBase64(bytes: Uint8Array): string {
  // Node/Deno-safe base64
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const B: any = (globalThis as any).Buffer;
  if (B) return B.from(bytes).toString("base64");
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).btoa(s);
}

function fromBase64(b64: string): Uint8Array {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const B: any = (globalThis as any).Buffer;
  if (B) return new Uint8Array(B.from(b64, "base64"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bin = (globalThis as any).atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function callGeminiImageEdit(apiKey: string, inputMime: string, inputB64: string): Promise<{ mime: string; b64: string }> {
  let lastErr: Error | null = null;
  for (const model of GEMINI_IMAGE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { inline_data: { mime_type: inputMime, data: inputB64 } },
                { text: EDIT_PROMPT },
              ],
            },
          ],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Gemini ${model} ${res.status}: ${txt.slice(0, 300)}`);
      }
      const json = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts ?? [];
      const imgPart = parts.find((p: any) => p?.inline_data?.data || p?.inlineData?.data);
      const data = imgPart?.inline_data?.data || imgPart?.inlineData?.data;
      const mime = imgPart?.inline_data?.mime_type || imgPart?.inlineData?.mimeType || "image/png";
      if (!data) throw new Error(`Gemini ${model} returned no image data`);
      return { mime, b64: data };
    } catch (e) {
      lastErr = e as Error;
    }
  }
  throw lastErr ?? new Error("Gemini image edit failed");
}

/* ─────────────────────────────  Server functions  ───────────────────────────── */

export type WhiteBgImageRow = {
  id: string;
  product_id: string;
  url: string;
  original_url: string | null;
  white_bg_url: string | null;
  white_bg_status: string | null;
  white_bg_error: string | null;
  is_primary: boolean;
  display_order: number;
  product: { id: string; name: string; slug: string; brand: { name: string; slug: string } | null } | null;
};

export const listWhiteBgImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => (input ?? {}) as { brandSlug?: string; productId?: string; statusFilter?: string })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    let q = context.supabase
      .from("product_images")
      .select(
        "id, product_id, url, original_url, white_bg_url, white_bg_status, white_bg_error, is_primary, display_order, product:products!inner(id, name, slug, brand:brands(name, slug))",
      )
      .order("display_order", { ascending: true });
    if (data.productId) q = q.eq("product_id", data.productId);
    if (data.statusFilter && data.statusFilter !== "all") {
      if (data.statusFilter === "none") q = q.is("white_bg_status", null);
      else q = q.eq("white_bg_status", data.statusFilter);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    let filtered = (rows as WhiteBgImageRow[]) ?? [];
    if (data.brandSlug) {
      filtered = filtered.filter((r) => r.product?.brand?.slug === data.brandSlug);
    }
    return filtered;
  });

export const processImageWhiteBg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => input as { imageId: string; force?: boolean })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const { data: row, error: rowErr } = await context.supabase
      .from("product_images")
      .select("id, product_id, url, original_url, white_bg_url, white_bg_status")
      .eq("id", data.imageId)
      .single();
    if (rowErr || !row) throw new Error(rowErr?.message || "Image not found");

    if (!data.force && row.white_bg_status === "ready") {
      return { imageId: row.id, status: "ready" as const, whiteBgUrl: row.white_bg_url, skipped: true };
    }
    if (!data.force && row.white_bg_status === "approved") {
      return { imageId: row.id, status: "approved" as const, whiteBgUrl: row.white_bg_url, skipped: true };
    }

    // Mark processing (best-effort — do not fail the run if the write is throttled).
    await context.supabase
      .from("product_images")
      .update({ white_bg_status: "processing", white_bg_error: null })
      .eq("id", row.id);

    try {
      const source = row.original_url ?? row.url;
      const { bytes, mime } = await downloadImageBytes(context.supabase, source);
      const inputB64 = toBase64(bytes);
      const { mime: outMime, b64: outB64 } = await callGeminiImageEdit(apiKey, mime, inputB64);

      const ext = outMime.includes("jpeg") || outMime.includes("jpg") ? "jpg" : "png";
      const path = `${row.product_id}/wb/${row.id}.${ext}`;
      const outBytes = fromBase64(outB64);
      const { error: upErr } = await context.supabase.storage
        .from(BUCKET)
        .upload(path, outBytes, { contentType: outMime, upsert: true, cacheControl: "3600" });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

      const compactRef = `${BUCKET}::${path}`;
      const { error: updErr } = await context.supabase
        .from("product_images")
        .update({
          white_bg_url: compactRef,
          white_bg_status: "ready",
          white_bg_error: null,
          white_bg_processed_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (updErr) throw new Error(updErr.message);

      return { imageId: row.id, status: "ready" as const, whiteBgUrl: compactRef, skipped: false };
    } catch (e) {
      const msg = (e as Error).message.slice(0, 500);
      await context.supabase
        .from("product_images")
        .update({ white_bg_status: "failed", white_bg_error: msg })
        .eq("id", row.id);
      return { imageId: row.id, status: "failed" as const, error: msg };
    }
  });

export const approveImageWhiteBg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => input as { imageId: string })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("product_images")
      .select("id, url, original_url, white_bg_url, white_bg_status")
      .eq("id", data.imageId)
      .single();
    if (error || !row) throw new Error(error?.message || "Image not found");
    if (!row.white_bg_url) throw new Error("No white-background variant to approve");
    const originalUrl = row.original_url ?? row.url;
    const { error: updErr } = await context.supabase
      .from("product_images")
      .update({
        url: row.white_bg_url,
        original_url: originalUrl,
        white_bg_status: "approved",
      })
      .eq("id", row.id);
    if (updErr) throw new Error(updErr.message);
    return { ok: true };
  });

export const revertImageWhiteBg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => input as { imageId: string })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("product_images")
      .select("id, url, original_url, white_bg_url, white_bg_status")
      .eq("id", data.imageId)
      .single();
    if (error || !row) throw new Error(error?.message || "Image not found");
    if (!row.original_url) throw new Error("No original backup to revert to");
    const { error: updErr } = await context.supabase
      .from("product_images")
      .update({
        url: row.original_url,
        // Keep the generated variant on disk in case the admin wants to re-approve later.
        white_bg_status: row.white_bg_url ? "ready" : null,
      })
      .eq("id", row.id);
    if (updErr) throw new Error(updErr.message);
    return { ok: true };
  });

export const rejectImageWhiteBg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => input as { imageId: string })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    // Just clear the pending variant metadata. The physical file (if any) is left in
    // storage; it will be overwritten next time the image is re-processed.
    const { error } = await context.supabase
      .from("product_images")
      .update({
        white_bg_url: null,
        white_bg_status: null,
        white_bg_error: null,
      })
      .eq("id", data.imageId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
