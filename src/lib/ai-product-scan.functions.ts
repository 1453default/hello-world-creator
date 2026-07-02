import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ScannedProduct = {
  brand: string;
  model: string;
  variant: string;
  storage: string;
  ram: string;
  color: string;
  sellingPrice: string;
  stickerPrice: string;
  condition: string;
  notes: string;
  defects: string;
  description: string;
  category: string;
  confidence: number;
};

const SYSTEM_PROMPT = `You are an expert product cataloger for a used mobile phone shop in India.
You will be shown ONE image of a smartphone (or its retail sticker/box). Extract structured product data.

Rules:
- Return ONLY a single JSON object matching the given schema. No prose, no markdown.
- Never invent data. If a field is not clearly visible or inferable, return an empty string "".
- "sellingPrice" and "stickerPrice" are numbers as plain digits (e.g. "15500"), no currency symbols. Empty string if not visible.
- "condition" is one of: "like_new", "good", "fair", "poor", or "".
- "confidence" is 0..1 indicating overall extraction confidence.
- Prefer the sticker text if a shop price sticker is visible.
- For "description", write ONE short marketing line (max ~120 chars) only if brand+model are known, otherwise "".`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    brand: { type: "string" },
    model: { type: "string" },
    variant: { type: "string" },
    storage: { type: "string" },
    ram: { type: "string" },
    color: { type: "string" },
    sellingPrice: { type: "string" },
    stickerPrice: { type: "string" },
    condition: { type: "string" },
    notes: { type: "string" },
    defects: { type: "string" },
    description: { type: "string" },
    category: { type: "string" },
    confidence: { type: "number" },
  },
  required: [
    "brand", "model", "variant", "storage", "ram", "color",
    "sellingPrice", "stickerPrice", "condition", "notes",
    "defects", "description", "category", "confidence",
  ],
  additionalProperties: false,
};

export const analyzeProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const d = input as { imageDataUrl?: string; hint?: string };
    if (!d?.imageDataUrl || typeof d.imageDataUrl !== "string") {
      throw new Error("imageDataUrl is required");
    }
    if (!d.imageDataUrl.startsWith("data:image/")) {
      throw new Error("imageDataUrl must be a data URL (data:image/...;base64,...)");
    }
    if (d.imageDataUrl.length > 8_000_000) {
      throw new Error("Image too large — please use a smaller image (<6MB).");
    }
    return { imageDataUrl: d.imageDataUrl, hint: (d.hint ?? "").toString().slice(0, 500) };
  })
  .handler(async ({ data }): Promise<ScannedProduct> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("AI is not configured on the server (missing LOVABLE_API_KEY).");
    }

    const userText = data.hint
      ? `Analyze this product image and return JSON. Admin hint: ${data.hint}`
      : "Analyze this product image and return JSON.";

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "ScannedProduct", schema: RESPONSE_SCHEMA, strict: true },
      },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("AI is rate-limited. Please retry in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace billing.");
      throw new Error(`AI request failed (${res.status}): ${errText.slice(0, 300)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    let parsed: Partial<ScannedProduct>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI returned an unreadable response. Please try again.");
      try {
        parsed = JSON.parse(m[0]);
      } catch {
        throw new Error("AI returned invalid JSON. Please try again.");
      }
    }

    const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const n = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);
    return {
      brand: s(parsed.brand),
      model: s(parsed.model),
      variant: s(parsed.variant),
      storage: s(parsed.storage),
      ram: s(parsed.ram),
      color: s(parsed.color),
      sellingPrice: s(parsed.sellingPrice),
      stickerPrice: s(parsed.stickerPrice),
      condition: s(parsed.condition),
      notes: s(parsed.notes),
      defects: s(parsed.defects),
      description: s(parsed.description),
      category: s(parsed.category),
      confidence: n(parsed.confidence),
    };
  });
