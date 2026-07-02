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
- Return ONLY a single JSON object matching the given schema. No prose, no markdown, no code fences.
- Never invent data. If a field is not clearly visible or inferable, return an empty string "".
- "sellingPrice" and "stickerPrice" are numbers as plain digits (e.g. "15500"), no currency symbols. Empty string if not visible.
- "condition" is one of: "like_new", "good", "fair", "poor", or "".
- "confidence" is a number 0..1 indicating overall extraction confidence.
- Prefer the sticker text if a shop price sticker is visible.
- For "description", write ONE short marketing line (max ~120 chars) only if brand+model are known, otherwise "".`;

// Gemini responseSchema (subset of OpenAPI). No additionalProperties / $schema.
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    brand: { type: "STRING" },
    model: { type: "STRING" },
    variant: { type: "STRING" },
    storage: { type: "STRING" },
    ram: { type: "STRING" },
    color: { type: "STRING" },
    sellingPrice: { type: "STRING" },
    stickerPrice: { type: "STRING" },
    condition: { type: "STRING" },
    notes: { type: "STRING" },
    defects: { type: "STRING" },
    description: { type: "STRING" },
    category: { type: "STRING" },
    confidence: { type: "NUMBER" },
  },
  required: [
    "brand", "model", "variant", "storage", "ram", "color",
    "sellingPrice", "stickerPrice", "condition", "notes",
    "defects", "description", "category", "confidence",
  ],
};

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
const LOVABLE_AI_MODEL = "google/gemini-2.5-flash";

function normalizeScan(parsed: Partial<ScannedProduct>): ScannedProduct {
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
}

function parseScanJson(raw: string): ScannedProduct {
  if (!raw.trim()) {
    throw new Error("AI returned an empty response. Please try again.");
  }
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
  return normalizeScan(parsed);
}

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
    const apiKey = process.env.GEMINI_API_KEY;
    const lovableApiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey && !lovableApiKey) throw new Error("AI scanning is not configured on the server.");

    // Parse data URL: data:image/jpeg;base64,XXXX
    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(data.imageDataUrl);
    if (!match) throw new Error("Invalid image data URL.");
    const mimeType = match[1];
    const base64 = match[2];

    const userText = data.hint
      ? `Analyze this product image and return JSON. Admin hint: ${data.hint}`
      : "Analyze this product image and return JSON.";

    const body = {
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          role: "user",
          parts: [
            { text: userText },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    };

    // Prefer Lovable AI Gateway when available so scans are not blocked by the custom Gemini key's quota.
    if (lovableApiKey) {
      const gatewayRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: LOVABLE_AI_MODEL,
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
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      }).catch((err) => {
        console.error("[analyzeProductImage] Lovable AI network error", (err as Error).message);
        return null;
      });

      if (gatewayRes?.ok) {
        const gatewayJson = (await gatewayRes.json()) as {
          choices?: { message?: { content?: string | { type?: string; text?: string }[] } }[];
        };
        const content = gatewayJson.choices?.[0]?.message?.content;
        const raw = Array.isArray(content) ? content.map((part) => part.text ?? "").join("") : (content ?? "");
        return parseScanJson(raw);
      }

      if (gatewayRes) {
        const text = await gatewayRes.text().catch(() => "");
        console.error("[analyzeProductImage] Lovable AI error", gatewayRes.status, text.slice(0, 800));
      }
    }

    if (!apiKey) throw new Error("AI scanning is temporarily unavailable. Please try again shortly.");

    // Retry transient failures (5xx / 429) and fail over to alternate Gemini Vision models.
    let res: Response | null = null;
    let lastErrText = "";
    let lastStatus = 0;
    let networkErr: Error | null = null;
    let lastModel = "";
    modelLoop:
    for (const model of GEMINI_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      for (let attempt = 0; attempt < 2; attempt++) {
        lastModel = model;
        try {
          res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify(body),
          });
          networkErr = null;
        } catch (err) {
          networkErr = err as Error;
          res = null;
        }
        if (res && res.ok) break modelLoop;
        if (res) {
          lastStatus = res.status;
          lastErrText = await res.text().catch(() => "");
          if (res.status < 500 && res.status !== 429) break modelLoop;
        }
        if (attempt < 1) await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (!res) {
      throw new Error(
        `Gemini AI is currently unavailable. (network error: ${networkErr?.message ?? "unknown"})`,
      );
    }

    if (!res.ok) {
      console.error("[analyzeProductImage] Gemini error", lastModel, lastStatus, lastErrText.slice(0, 800));
      if (lastStatus === 400 && /API key/i.test(lastErrText)) {
        throw new Error("Invalid Gemini API key. Please update GEMINI_API_KEY.");
      }
      if (lastStatus === 400 && /image|INVALID_ARGUMENT/i.test(lastErrText)) {
        throw new Error("Gemini couldn't process this image. Try a clearer or different photo.");
      }
      if (lastStatus === 401 || lastStatus === 403) {
        throw new Error("Gemini API key is invalid, expired, or lacks permission.");
      }
      if (lastStatus === 429) {
        throw new Error("Gemini AI is rate-limited. Please wait a moment and retry.");
      }
      if (lastStatus >= 500) {
        const snippet = lastErrText.replace(/\s+/g, " ").slice(0, 160);
        throw new Error(
          `Gemini AI is temporarily unavailable (HTTP ${lastStatus}). Please retry in a moment.${
            snippet ? ` Details: ${snippet}` : ""
          }`,
        );
      }
      throw new Error(`Gemini request failed (${lastStatus}): ${lastErrText.slice(0, 300)}`);
    }

    const json = (await res.json()) as {
      candidates?: {
        content?: { parts?: { text?: string }[] };
        finishReason?: string;
      }[];
      promptFeedback?: { blockReason?: string };
    };

    if (json.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked the image: ${json.promptFeedback.blockReason}`);
    }

    const raw = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    return parseScanJson(raw);
  });
