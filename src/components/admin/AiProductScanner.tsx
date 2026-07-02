import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Upload, Loader2, RotateCw, X, CheckCircle2, AlertTriangle, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { analyzeProductImage, type ScannedProduct } from "@/lib/ai-product-scan.functions";

/**
 * Reads a File as a data URL, downscaled + JPEG-encoded to keep the payload small.
 * Max edge 1600px, quality 0.85. Falls back to raw base64 if canvas fails.
 */
async function fileToCompressedDataUrl(file: File, maxEdge = 1600, quality = 0.85): Promise<string> {
  const raw = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("Could not read image file"));
    r.readAsDataURL(file);
  });
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("Could not decode image"));
      i.src = raw;
    });
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return raw;
  }
}

type Phase = "idle" | "uploading" | "analyzing" | "review" | "error";

export type AiScanResult = ScannedProduct & { imageDataUrl: string };

export function AiProductScanner({
  onAccept,
}: {
  onAccept: (result: AiScanResult) => void;
}) {
  const analyze = useServerFn(analyzeProductImage);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScannedProduct | null>(null);
  const [error, setError] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef<Map<string, ScannedProduct>>(new Map());

  const runAnalysis = useCallback(
    async (file: File) => {
      setPhase("uploading");
      setProgress("Preparing image…");
      setError("");
      setResult(null);
      const preview = URL.createObjectURL(file);
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return preview;
      });
      try {
        const compressed = await fileToCompressedDataUrl(file);
        setDataUrl(compressed);

        // Cache hash by first 128 chars of data URL — cheap dedupe within session
        const cacheKey = compressed.slice(-256);
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
          setResult(cached);
          setPhase("review");
          setProgress("");
          return;
        }

        setPhase("analyzing");
        setProgress("Analyzing product with AI…");
        const scanned = await analyze({ data: { imageDataUrl: compressed } });
        cacheRef.current.set(cacheKey, scanned);
        setResult(scanned);
        setPhase("review");
        setProgress("");
      } catch (e) {
        const msg = (e as Error).message || "AI analysis failed";
        setError(msg);
        setPhase("error");
        toast.error(msg);
      }
    },
    [analyze],
  );

  function handleFiles(files: FileList | null | undefined) {
    if (!files || files.length === 0) return;
    const file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) {
      toast.error("Please pick an image file");
      return;
    }
    void runAnalysis(file);
  }

  // Ctrl+V paste anywhere while the scanner is mounted & idle/review.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (phase === "analyzing" || phase === "uploading") return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === "file" && it.type.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) {
            e.preventDefault();
            void runAnalysis(f);
            return;
          }
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [phase, runAnalysis]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const busy = phase === "uploading" || phase === "analyzing";

  return (
    <div className="rounded-xl border border-amber/40 bg-gradient-to-br from-amber/10 via-admin-surface-2 to-admin-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber" />
        <h3 className="font-display text-sm font-bold text-admin-text">AI-Assisted Product Scan</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-admin-muted">Powered by Gemini Vision</span>
      </div>

      {phase !== "review" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (busy) return;
            handleFiles(e.dataTransfer.files);
          }}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center transition ${
            dragging ? "border-amber bg-amber/10" : "border-admin-border bg-admin-surface-2/50"
          } ${busy ? "opacity-90" : ""}`}
        >
          {previewUrl && (
            <img
              src={previewUrl}
              alt=""
              className="mx-auto max-h-40 rounded-md object-contain shadow"
            />
          )}
          {busy ? (
            <div className="flex items-center gap-2 text-sm text-admin-text">
              <Loader2 className="h-4 w-4 animate-spin text-amber" />
              <span>{progress}</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-admin-text">
                Upload, drag &amp; drop, or paste a product photo — AI will auto-fill the form.
              </p>
              <p className="text-xs text-admin-muted">
                First image becomes the primary. Ctrl+V works too.
              </p>
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-amber px-3 py-1.5 text-xs font-bold text-ink hover:brightness-110"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload image
                </button>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:border-amber/50"
                >
                  <Camera className="h-3.5 w-3.5" /> Camera
                </button>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {phase === "error" && error && (
                <div className="mt-2 flex items-start gap-2 rounded-md border border-ruby/40 bg-ruby/10 px-3 py-2 text-left text-xs text-ruby">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div>
                    <div className="font-semibold">AI analysis failed</div>
                    <div className="opacity-80">{error}</div>
                    <div className="mt-1 opacity-70">You can still fill the form manually below.</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {phase === "review" && result && (
        <ReviewCard
          result={result}
          previewUrl={previewUrl}
          onAccept={() => {
            if (!dataUrl) return;
            onAccept({ ...result, imageDataUrl: dataUrl });
            toast.success("Fields populated — verify and save");
          }}
          onRescan={() => {
            setPhase("idle");
            setResult(null);
          }}
          onCancel={() => {
            setPhase("idle");
            setResult(null);
            setPreviewUrl((old) => {
              if (old) URL.revokeObjectURL(old);
              return null;
            });
            setDataUrl(null);
          }}
          onAnalyzeAgain={async () => {
            if (!dataUrl) return;
            setPhase("analyzing");
            setProgress("Re-analyzing…");
            try {
              const scanned = await analyze({ data: { imageDataUrl: dataUrl } });
              setResult(scanned);
              setPhase("review");
            } catch (e) {
              const msg = (e as Error).message;
              setError(msg);
              setPhase("error");
              toast.error(msg);
            } finally {
              setProgress("");
            }
          }}
        />
      )}
    </div>
  );
}

function ReviewCard({
  result,
  previewUrl,
  onAccept,
  onRescan,
  onCancel,
  onAnalyzeAgain,
}: {
  result: ScannedProduct;
  previewUrl: string | null;
  onAccept: () => void;
  onRescan: () => void;
  onCancel: () => void;
  onAnalyzeAgain: () => void;
}) {
  const rows: Array<[string, string]> = [
    ["Brand", result.brand],
    ["Model", result.model],
    ["Variant", result.variant],
    ["Storage", result.storage],
    ["RAM", result.ram],
    ["Color", result.color],
    ["Selling Price", result.sellingPrice ? `₹${result.sellingPrice}` : ""],
    ["Sticker Price", result.stickerPrice ? `₹${result.stickerPrice}` : ""],
    ["Condition", result.condition],
    ["Category", result.category],
    ["Defects", result.defects],
    ["Notes", result.notes],
  ];
  const confidencePct = Math.round((result.confidence || 0) * 100);
  const confTone =
    confidencePct >= 80 ? "text-emerald" : confidencePct >= 50 ? "text-amber" : "text-ruby";

  return (
    <div className="grid gap-4 md:grid-cols-[180px_1fr]">
      <div className="space-y-2">
        {previewUrl && (
          <img src={previewUrl} alt="" className="w-full rounded-md border border-admin-border object-contain" />
        )}
        <div className="rounded-md border border-admin-border bg-admin-surface-2 px-2 py-1.5 text-center text-[11px]">
          <span className="text-admin-muted">Confidence:</span>{" "}
          <span className={`font-bold ${confTone}`}>{confidencePct}%</span>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald" />
          <span className="text-sm font-semibold text-admin-text">AI extracted these details</span>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-md border border-admin-border bg-admin-surface-2/60 p-3 text-xs">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-admin-muted">{k}</dt>
              <dd className={v ? "font-semibold text-admin-text" : "italic text-admin-muted/60"}>
                {v || "Couldn't determine"}
              </dd>
            </div>
          ))}
        </dl>

        {result.description && (
          <div className="mt-2 rounded-md border border-admin-border bg-admin-surface-2/60 p-3 text-xs">
            <div className="mb-1 text-admin-muted">Description</div>
            <div className="text-admin-text">{result.description}</div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber px-3 py-1.5 text-xs font-bold text-ink hover:brightness-110"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Accept &amp; Populate
          </button>
          <button
            type="button"
            onClick={onAnalyzeAgain}
            className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:border-amber/50"
          >
            <RotateCw className="h-3.5 w-3.5" /> Analyze Again
          </button>
          <button
            type="button"
            onClick={onRescan}
            className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:border-amber/50"
          >
            <Upload className="h-3.5 w-3.5" /> Scan Different Image
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-muted hover:text-admin-text"
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
