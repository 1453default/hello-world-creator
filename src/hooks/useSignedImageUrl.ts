import { useEffect, useState } from "react";
import { parseStorageRef } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 6;
const CACHE_REFRESH_MS = 1000 * 60 * 55 * 5;

type CacheEntry = {
  url: string;
  expiresAt: number;
};

const signedUrlCache = new Map<string, CacheEntry>();
const pendingSignedUrls = new Map<string, Promise<string>>();

async function signImageUrl(rawUrl: string): Promise<string> {
  const ref = parseStorageRef(rawUrl);
  if (!ref) return /^https?:\/\//i.test(rawUrl) ? rawUrl : "";

  const key = `${ref.bucket}::${ref.path}`;
  const cached = signedUrlCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const pending = pendingSignedUrls.get(key);
  if (pending) return pending;

  const request = supabase.storage
    .from(ref.bucket)
    .createSignedUrl(ref.path, SIGNED_URL_TTL_SECONDS)
    .then(({ data, error }) => {
      if (error || !data?.signedUrl) return "";
      signedUrlCache.set(key, {
        url: data.signedUrl,
        expiresAt: Date.now() + CACHE_REFRESH_MS,
      });
      return data.signedUrl;
    })
    .finally(() => {
      pendingSignedUrls.delete(key);
    });

  pendingSignedUrls.set(key, request);
  return request;
}

export function useSignedImageUrl(rawUrl: string | null | undefined): string {
  const [signedUrl, setSignedUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    const nextRawUrl = rawUrl ?? "";

    if (!nextRawUrl) {
      setSignedUrl("");
      return;
    }

    signImageUrl(nextRawUrl).then((nextSignedUrl) => {
      if (!cancelled) setSignedUrl(nextSignedUrl);
    });

    return () => {
      cancelled = true;
    };
  }, [rawUrl]);

  return signedUrl;
}