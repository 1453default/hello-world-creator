import { useEffect, useRef, useState, type ReactNode } from "react";
import { Instagram } from "lucide-react";
import { INSTAGRAM_PROFILE_URL } from "@/lib/instagram";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";
let scriptLoadingPromise: Promise<void> | null = null;

function loadInstagramScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.instgrm) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;
  scriptLoadingPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${EMBED_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      if (window.instgrm) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = EMBED_SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
  return scriptLoadingPromise;
}

function normalizeUrl(url: string): string {
  // Ensure trailing slash for Instagram's embed parser
  return url.endsWith("/") ? url : `${url}/`;
}

function ReelEmbed({ url }: { url: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    loadInstagramScript().then(() => {
      if (cancelled) return;
      try {
        window.instgrm?.Embeds.process();
      } catch {
        // ignore
      }
      // Mark as loaded shortly after process to fade out placeholder
      const t = window.setTimeout(() => setLoaded(true), 1200);
      return () => window.clearTimeout(t);
    });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const permalink = normalizeUrl(url);

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      style={{ minHeight: 560 }}
    >
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-card to-muted/30 animate-pulse">
          <Instagram className="h-8 w-8 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Loading post…</span>
        </div>
      )}
      {visible && (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={permalink}
          data-instgrm-version="14"
          style={{
            background: "transparent",
            border: 0,
            margin: 0,
            padding: 0,
            width: "100%",
            minWidth: 0,
          }}
        >
          <a href={permalink} target="_blank" rel="noopener noreferrer">
            View on Instagram
          </a>
        </blockquote>
      )}
    </div>
  );
}

export interface InstagramReelsProps {
  title: string;
  subtitle?: string;
  urls: string[];
  showCta?: boolean;
  ctaLabel?: string;
  eyebrow?: ReactNode;
}

export function InstagramReels({
  title,
  subtitle,
  urls,
  showCta = false,
  ctaLabel = "View More on Instagram",
  eyebrow,
}: InstagramReelsProps) {
  if (!urls.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 mt-12">
      <div className="mb-6 text-center md:text-left">
        {eyebrow && (
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm md:text-base text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {urls.map((url) => (
          <ReelEmbed key={url} url={url} />
        ))}
      </div>

      {showCta && (
        <div className="mt-8 flex justify-center">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-bold text-white hover:bg-ink/90 transition"
          >
            <Instagram className="h-5 w-5" />
            {ctaLabel}
          </a>
        </div>
      )}
    </section>
  );
}
