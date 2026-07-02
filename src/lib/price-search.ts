/**
 * Price-aware search query parser.
 *
 * Extracts price intent (exact, range, under/above) from a free-text search
 * query and returns the remaining tokens as plain text to match against
 * product name / brand / specs.
 *
 * Supports:
 *   35000, 35,000, ₹35000, ₹35,000, 35000rs, 35000 rs, 35k, 35 K, 35000 INR
 *   under 40000, below 50000, less than 25000
 *   above 30000, over 30000, more than 50000
 *   between 20000 and 30000, 25000-35000, 25000 to 35000
 *   combined:  "iPhone 35000", "Samsung under 25000", "Apple 128GB 45000"
 */

export type PriceIntent =
  | { kind: "none" }
  | { kind: "exact"; value: number; tolerance: number }
  | { kind: "range"; min: number; max: number }
  | { kind: "lte"; max: number }
  | { kind: "gte"; min: number };

export type ParsedQuery = {
  /** Cleaned text tokens with price fragments stripped. Lowercase. */
  text: string;
  price: PriceIntent;
};

/** Parse a numeric fragment like "35", "35k", "35,000", "₹35000", "35000rs". */
function parseAmount(raw: string): number | null {
  if (!raw) return null;
  let s = raw.toLowerCase().replace(/[₹,\s]/g, "").replace(/(?:rs|inr)$/i, "");
  let mult = 1;
  if (/k$/.test(s)) {
    mult = 1_000;
    s = s.slice(0, -1);
  } else if (/(?:lakh|lac|l)$/.test(s)) {
    mult = 100_000;
    s = s.replace(/(?:lakh|lac|l)$/i, "");
  } else if (/(?:cr|crore)$/.test(s)) {
    mult = 10_000_000;
    s = s.replace(/(?:cr|crore)$/i, "");
  }
  if (!/^\d+(?:\.\d+)?$/.test(s)) return null;
  const n = Number(s) * mult;
  return Number.isFinite(n) && n > 0 ? n : null;
}

// One "amount token" (order matters: multi-char suffixes before bare digits).
const AMOUNT = String.raw`(?:₹\s*)?\d[\d,]*(?:\.\d+)?\s*(?:k|lakh|lac|l|cr|crore|rs|inr)?`;

/**
 * Parse a free-text query and return normalized text tokens + price intent.
 * Non-price tokens are preserved verbatim (lowercased) so brand / model /
 * spec matching keeps working exactly as before.
 */
export function parseSearchQuery(input: string): ParsedQuery {
  const original = (input ?? "").trim();
  if (!original) return { text: "", price: { kind: "none" } };
  let s = ` ${original.toLowerCase()} `;

  let price: PriceIntent = { kind: "none" };
  const strip = (re: RegExp) => {
    s = s.replace(re, " ");
  };

  // between A and B  |  A to B  |  A - B
  const between = new RegExp(
    String.raw`\bbetween\s+(${AMOUNT})\s+(?:and|to|-)\s+(${AMOUNT})\b`,
    "i",
  );
  const dashRange = new RegExp(String.raw`(${AMOUNT})\s*(?:-|–|to)\s*(${AMOUNT})`, "i");
  let m = s.match(between) || s.match(dashRange);
  if (m) {
    const a = parseAmount(m[1]);
    const b = parseAmount(m[2]);
    if (a != null && b != null) {
      price = { kind: "range", min: Math.min(a, b), max: Math.max(a, b) };
      strip(m[0].includes("between") ? between : dashRange);
    }
  }

  // under / below / less than / <= / <
  if (price.kind === "none") {
    const under = new RegExp(
      String.raw`\b(?:under|below|less\s+than|upto|up\s+to|max|<=?)\s*(${AMOUNT})`,
      "i",
    );
    m = s.match(under);
    if (m) {
      const v = parseAmount(m[1]);
      if (v != null) {
        price = { kind: "lte", max: v };
        strip(under);
      }
    }
  }

  // above / over / more than / >= / >
  if (price.kind === "none") {
    const above = new RegExp(
      String.raw`\b(?:above|over|more\s+than|min|>=?)\s*(${AMOUNT})`,
      "i",
    );
    m = s.match(above);
    if (m) {
      const v = parseAmount(m[1]);
      if (v != null) {
        price = { kind: "gte", min: v };
        strip(above);
      }
    }
  }

  // Bare numeric amount → exact (with tolerance). Only strip when it has a
  // price marker (₹, k, rs, inr, commas) OR is a large standalone number
  // (>= 1000). Keeps small numbers like "iPhone 13" as text tokens.
  if (price.kind === "none") {
    const priced = new RegExp(
      String.raw`(?:^|\s)((?:₹\s*)?\d[\d,]*(?:\.\d+)?\s*(?:k|lakh|lac|l|cr|crore|rs|inr)|₹\s*\d[\d,]*(?:\.\d+)?|\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d{4,})(?=\s|$)`,
      "i",
    );
    m = s.match(priced);
    if (m) {
      const v = parseAmount(m[1]);
      if (v != null) {
        price = { kind: "exact", value: v, tolerance: Math.max(500, v * 0.1) };
        s = s.replace(m[0], " ");
      }
    }
  }

  const text = s.replace(/\s+/g, " ").trim();
  return { text, price };
}

/** True when a given price satisfies the parsed price intent. */
export function priceMatches(price: number | null | undefined, intent: PriceIntent): boolean {
  if (intent.kind === "none") return true;
  const p = Number(price ?? 0);
  if (!Number.isFinite(p)) return false;
  switch (intent.kind) {
    case "exact":
      return Math.abs(p - intent.value) <= intent.tolerance;
    case "range":
      return p >= intent.min && p <= intent.max;
    case "lte":
      return p <= intent.max;
    case "gte":
      return p >= intent.min;
  }
}

/**
 * Sort helper: for exact-price intent, closest-first; otherwise no reorder.
 * Returns a compare function suitable for Array.prototype.sort.
 */
export function priceRelevanceCompare(intent: PriceIntent) {
  if (intent.kind !== "exact") return () => 0;
  const target = intent.value;
  return (a: { selling_price?: number | null }, b: { selling_price?: number | null }) =>
    Math.abs(Number(a.selling_price ?? 0) - target) -
    Math.abs(Number(b.selling_price ?? 0) - target);
}
