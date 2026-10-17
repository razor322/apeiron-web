import type { AstronomyMedia, AstronomySnapshot } from "@/lib/astronomy/models";
import { NasaImagesSchema } from "@/lib/astronomy/schemas/nasa-images";
import { cached } from "@/lib/cache/ttl-cache";
import { logProvider, timeProvider } from "@/lib/astronomy/log";

const BASE_URL = "https://images-api.nasa.gov/search";
const PROVIDER = "nasa-images";
const TTL_MS = 24 * 60 * 60 * 1000;

export class ImageRateLimitError extends Error {
  constructor(public status: number) {
    super(`nasa_images_rate_limited_${status}`);
    this.name = "ImageRateLimitError";
  }
}

// One search page mapped to AstronomyMedia items (only entries that carry an
// image link). Returns up to `limit` items.
async function runSearch(query: string, limit: number): Promise<AstronomyMedia[]> {
  const elapsed = timeProvider();
  const url = new URL(BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("media_type", "image");
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (res.status === 429 || res.status === 403) {
    logProvider({ provider: PROVIDER, event: "rate_limited", status: res.status });
    throw new ImageRateLimitError(res.status);
  }
  if (!res.ok) {
    logProvider({ provider: PROVIDER, event: "error", status: res.status });
    throw new Error(`nasa_images_http_${res.status}`);
  }
  const parsed = NasaImagesSchema.parse(await res.json());
  const withLinks = parsed.collection.items.filter((entry) => entry.links && entry.links.length > 0);
  if (withLinks.length === 0) throw new Error("nasa_images_empty");
  logProvider({ provider: PROVIDER, event: "ok", ms: elapsed() });

  return withLinks.slice(0, limit).map((item) => {
    const meta = item.data[0]!;
    const previewUrl = item.links![0]!.href;
    return {
      id: meta.nasa_id,
      title: meta.title,
      mediaType: "image" as const,
      previewUrl,
      originalUrl: previewUrl,
      sourceName: "NASA Image and Video Library",
      sourceUrl: `https://images.nasa.gov/details/${meta.nasa_id}`,
      credit: "NASA",
      rightsNote: "NASA material is generally not copyrighted.",
      altText: meta.title,
      explanation: meta.description,
      publishedAt: meta.date_created,
      retrievedAt: new Date().toISOString(),
    } satisfies AstronomyMedia;
  });
}

// The first matching image. Kept for single-result consumers.
export async function searchNasaImage(
  query: string,
): Promise<AstronomySnapshot<AstronomyMedia>> {
  const key = `${PROVIDER}:${query}:1`;
  const snap = await cached<AstronomyMedia>(key, TTL_MS, async () => {
    logProvider({ provider: PROVIDER, event: "cache_miss" });
    return (await runSearch(query, 1))[0]!;
  });
  if (snap.cacheHit === true) logProvider({ provider: PROVIDER, event: "cache_hit" });
  // cached() stamps provider: "cache"; the adapter owns its provider identity.
  return { ...snap, provider: PROVIDER };
}

// Several matching images, for the gallery. Newest first is not guaranteed by the
// API, so the order is whatever the search returns.
export async function searchNasaImages(
  query: string,
  limit = 6,
): Promise<AstronomySnapshot<AstronomyMedia[]>> {
  const key = `${PROVIDER}:${query}:${limit}`;
  const snap = await cached<AstronomyMedia[]>(key, TTL_MS, async () => {
    logProvider({ provider: PROVIDER, event: "cache_miss" });
    return runSearch(query, limit);
  });
  if (snap.cacheHit === true) logProvider({ provider: PROVIDER, event: "cache_hit" });
  return { ...snap, provider: PROVIDER };
}
