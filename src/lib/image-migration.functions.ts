/**
 * One-time bulk migration of product images to a clean pure-white background.
 *
 * Safety guarantees:
 *  - Originals are NEVER deleted. The original storage reference is copied to
 *    `product_images.original_url` before the row's `url` is swapped.
 *  - Processed files live under a `processed/` prefix in the same bucket so they
 *    cannot collide with originals.
 *  - Failures are recorded in `process_status='failed'` + `process_error`, the
 *    row's URL is left untouched, and the site keeps rendering the original.
 *  - The migration is resumable: any image with `process_status IS NULL` or
 *    `= 'failed'` is a candidate.
 *
 * Public site: `signImageList()` in `src/lib/catalog.ts` already understands
 * the `bucket::path` compact form, so replacing `url` transparently switches
 * every surface (home / catalog / product / brand / featured / admin) to the
 * new white-background version.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertStaff(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (data) return;
  const { data: staffData, error: staffErr } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "super_admin",
  });
  if (staffErr) throw new Error(staffErr.message);
  if (!staffData) throw new Error("Forbidden: admin role required");
}

/** Parse any of our stored URL formats to { bucket, path }. Mirrors src/lib/catalog.ts. */
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

function isProcessedPath(path: string) {
  return path.startsWith("processed/");
}

export type MigrationStats = {
  total: number;
  done: number;
  failed: number;
  pending: number;
  skipped: number;
};

export const getImageMigrationStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MigrationStats> => {
    await assertStaff(context);
    const count = async (filter?: (q: any) => any) => {
      let q = context.supabase.from("product_images").select("id", { count: "exact", head: true });
      if (filter) q = filter(q);
      const { count: c, error } = await q;
      if (error) throw new Error(error.message);
      return c ?? 0;
    };
    const total = await count();
    const done = await count((q) => q.eq("process_status", "done"));
    const failed = await count((q) => q.eq("process_status", "failed"));
    const skipped = await count((q) => q.eq("process_status", "skipped"));
    const pending = Math.max(0, total - done - failed - skipped);
    return { total, done, failed, pending, skipped };
  });

export type PendingImage = {
  id: string;
  url: string;
  original_url: string | null;
  product_id: string;
  product_name: string;
  status: "pending" | "failed" | "done" | "skipped";
  process_error: string | null;
};

export const listMigrationCandidates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const d = (input ?? {}) as { mode?: "pending" | "failed" | "done"; limit?: number };
    return {
      mode: (d.mode ?? "pending") as "pending" | "failed" | "done",
      limit: Math.min(Math.max(1, Number(d.limit ?? 500)), 2000),
    };
  })
  .handler(async ({ context, data }): Promise<PendingImage[]> => {
    await assertStaff(context);
    let q = context.supabase
      .from("product_images")
      .select("id, url, original_url, product_id, process_status, process_error, products!inner(brand, model)")
      .order("created_at", { ascending: true })
      .limit(data.limit);
    if (data.mode === "pending") q = q.is("process_status", null);
    else if (data.mode === "failed") q = q.eq("process_status", "failed");
    else if (data.mode === "done") q = q.eq("process_status", "done");
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => ({
      id: r.id,
      url: r.url,
      original_url: r.original_url,
      product_id: r.product_id,
      product_name: `${r.products?.brand ?? ""} ${r.products?.model ?? ""}`.trim(),
      status: (r.process_status ?? "pending") as PendingImage["status"],
      process_error: r.process_error,
    }));
  });

/** Ask Gemini (Nano Banana) to redraw the image with a pure white background. */
async function whiteBgViaGemini(base64: string, mimeType: string): Promise<{ data: string; mimeType: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!apiKey && !lovableKey) throw new Error("No AI key configured (GEMINI_API_KEY / LOVABLE_API_KEY).");

  const prompt =
    "Replace the background of this product photo with a pure, uniform white (#FFFFFF) studio background. " +
    "Keep the phone/product fully intact, sharp, centered, and correctly proportioned. Do NOT alter the phone " +
    "itself, its colors, screen content, logos, buttons, ports, or edges. Preserve the original resolution and " +
    "aspect ratio. Produce clean cutout edges (no halo, no fringe), add only a very subtle natural contact shadow " +
    "at the base. Output a single high-quality product image on a pure white background. Do not add text.";

  // Prefer direct Gemini (nano-banana image model). Retry once on 5xx/429.
  if (apiKey) {
    const models = ["gemini-2.5-flash-image-preview", "gemini-2.5-flash-image"];
    let lastErr = "";
    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        let res: Response | null = null;
        try {
          res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: prompt }, { inlineData: { mimeType, data: base64 } }],
                },
              ],
              generationConfig: { responseModalities: ["IMAGE"] },
            }),
          });
        } catch (e) {
          lastErr = `network: ${(e as Error).message}`;
          continue;
        }
        if (res.ok) {
          const j = (await res.json()) as any;
          const parts = j.candidates?.[0]?.content?.parts ?? [];
          for (const p of parts) {
            const inline = p.inlineData ?? p.inline_data;
            if (inline?.data) {
              return { data: inline.data, mimeType: inline.mimeType ?? inline.mime_type ?? "image/png" };
            }
          }
          lastErr = "Gemini returned no image part";
          break; // try next model
        }
        const text = await res.text().catch(() => "");
        lastErr = `Gemini ${res.status}: ${text.slice(0, 200)}`;
        if (res.status < 500 && res.status !== 429) break; // do not retry client errors
        await new Promise((r) => setTimeout(r, 600));
      }
    }
    if (!lovableKey) throw new Error(lastErr || "Gemini image generation failed");
  }

  // Fallback: Lovable AI gateway.
  if (lovableKey) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Lovable AI ${res.status}: ${t.slice(0, 200)}`);
    }
    const j = (await res.json()) as any;
    const msg = j.choices?.[0]?.message;
    const imgs: any[] = msg?.images ?? [];
    for (const im of imgs) {
      const u: string | undefined = im?.image_url?.url ?? im?.url;
      if (u?.startsWith("data:image/")) {
        const m = u.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (m) return { data: m[2], mimeType: m[1] };
      }
    }
    throw new Error("Lovable AI returned no image");
  }

  throw new Error("Image generation unavailable");
}

export type ProcessResult = {
  id: string;
  status: "done" | "failed" | "skipped";
  error?: string;
  newUrl?: string;
};

export const processProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const d = input as { id?: string; force?: boolean };
    if (!d?.id || typeof d.id !== "string") throw new Error("id is required");
    return { id: d.id, force: !!d.force };
  })
  .handler(async ({ context, data }): Promise<ProcessResult> => {
    await assertStaff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch the row (admin, so we can read everything).
    const { data: row, error: rowErr } = await supabaseAdmin
      .from("product_images")
      .select("id, url, original_url, process_status")
      .eq("id", data.id)
      .maybeSingle();
    if (rowErr) throw new Error(rowErr.message);
    if (!row) throw new Error("Image not found");

    if (!data.force && row.process_status === "done") {
      return { id: row.id, status: "skipped" };
    }

    // Prefer the original if we've already processed once (retry against the source).
    const sourceUrl = row.original_url ?? row.url;
    const ref = parseStorageRef(sourceUrl);
    if (!ref) {
      await supabaseAdmin
        .from("product_images")
        .update({ process_status: "failed", process_error: "Unrecognized URL format", processed_at: new Date().toISOString() })
        .eq("id", row.id);
      return { id: row.id, status: "failed", error: "Unrecognized URL format" };
    }

    if (isProcessedPath(ref.path) && !data.force) {
      // Already a processed asset — mark done, don't re-process.
      await supabaseAdmin
        .from("product_images")
        .update({ process_status: "done", processed_at: new Date().toISOString(), process_error: null })
        .eq("id", row.id);
      return { id: row.id, status: "skipped" };
    }

    try {
      // Download original bytes.
      const dl = await supabaseAdmin.storage.from(ref.bucket).download(ref.path);
      if (dl.error || !dl.data) throw new Error(`download: ${dl.error?.message ?? "no data"}`);
      const buf = new Uint8Array(await dl.data.arrayBuffer());
      if (buf.byteLength === 0) throw new Error("Original file is empty");
      if (buf.byteLength > 8 * 1024 * 1024) throw new Error("Original file too large (>8MB)");

      // Best-effort MIME detection.
      const mimeType = detectMime(buf) ?? "image/jpeg";
      const base64 = uint8ToBase64(buf);

      // Ask AI for the white-bg version.
      const out = await whiteBgViaGemini(base64, mimeType);
      const outBytes = base64ToUint8(out.data);
      if (outBytes.byteLength < 1024) throw new Error("AI returned an image that is too small");

      // Upload under processed/<original path>.<ext>.
      const ext = extFromMime(out.mimeType);
      const processedPath = `processed/${ref.path.replace(/\.[a-zA-Z0-9]+$/, "")}.${ext}`;
      const up = await supabaseAdmin.storage
        .from(ref.bucket)
        .upload(processedPath, outBytes, {
          contentType: out.mimeType,
          upsert: true,
          cacheControl: "31536000",
        });
      if (up.error) throw new Error(`upload: ${up.error.message}`);

      const newCompact = `${ref.bucket}::${processedPath}`;
      const patch: {
        url: string;
        process_status: string;
        processed_at: string;
        process_error: string | null;
        original_url?: string;
      } = {
        url: newCompact,
        process_status: "done",
        processed_at: new Date().toISOString(),
        process_error: null,
      };
      if (!row.original_url) patch.original_url = `${ref.bucket}::${ref.path}`;

      const { error: updErr } = await supabaseAdmin
        .from("product_images")
        .update(patch)
        .eq("id", row.id);
      if (updErr) throw new Error(`db: ${updErr.message}`);


      return { id: row.id, status: "done", newUrl: newCompact };
    } catch (e) {
      const msg = (e as Error).message ?? "unknown error";
      await supabaseAdmin
        .from("product_images")
        .update({
          process_status: "failed",
          process_error: msg.slice(0, 500),
          processed_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      return { id: row.id, status: "failed", error: msg };
    }
  });

// ————————————————— tiny helpers —————————————————
function uint8ToBase64(u8: Uint8Array): string {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    s += String.fromCharCode(...u8.subarray(i, i + chunk));
  }
  // Node & browser both have btoa on globalThis in this runtime.
  return typeof btoa === "function" ? btoa(s) : Buffer.from(u8).toString("base64");
}
function base64ToUint8(b64: string): Uint8Array {
  if (typeof atob === "function") {
    const bin = atob(b64);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  return new Uint8Array(Buffer.from(b64, "base64"));
}
function detectMime(u8: Uint8Array): string | null {
  if (u8.length >= 3 && u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff) return "image/jpeg";
  if (
    u8.length >= 8 &&
    u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47
  ) return "image/png";
  if (
    u8.length >= 6 && u8[0] === 0x47 && u8[1] === 0x49 && u8[2] === 0x46
  ) return "image/gif";
  if (
    u8.length >= 12 && u8[0] === 0x52 && u8[1] === 0x49 && u8[2] === 0x46 && u8[3] === 0x46 &&
    u8[8] === 0x57 && u8[9] === 0x45 && u8[10] === 0x42 && u8[11] === 0x50
  ) return "image/webp";
  return null;
}
function extFromMime(m: string): string {
  if (m === "image/jpeg") return "jpg";
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  if (m === "image/gif") return "gif";
  return "png";
}
