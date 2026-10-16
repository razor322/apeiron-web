import type { AstronomyMedia, AstronomySnapshot } from "@/lib/astronomy/models";
import { logProvider, timeProvider } from "@/lib/astronomy/log";
import { NasaImagesSchema } from "@/lib/astronomy/schemas/nasa-images";
import { cached } from "@/lib/cache/ttl-cache";

const BASE_URL = "https://images-api.nasa.gov/search";
const PROVIDER = "nasa-images";
const TTL_MS = 24 * 60 * 60 * 1000;

// ponytail: not wired to any page yet; the planet pages use the curated static
// registry. Wire this in when live/higher-resolution imagery is wanted.
export async function searchNasaImage(
  query: string,
): Promise<AstronomySnapshot<AstronomyMedia>> {
  const key = `${PROVIDER}:${query}`;
  const elapsed = timeProvider();
  logProvider({ provider: PROVIDER, event: "cache_miss" });
  const snap = await cached<AstronomyMedia>(key, TTL_MS, async () => {
    const url = new URL(BASE_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("media_type", "image");
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (res.status === 429 || res.status === 403) {
      logProvider({ provider: PROVIDER, event: "rate_limited", status: res.status });
      throw new Error(`nasa_images_rate_limited_${res.status}`);
    }
    if (!res.ok) {
      logProvider({ provider: PROVIDER, event: "error", status: res.status });
      throw new Error(`nasa_images_http_${res.status}`);
    }
    const parsed = NasaImagesSchema.parse(await res.json());

    const item = parsed.collection.items.find(
      (entry) => entry.links && entry.links.length > 0,
    );
    if (!item) throw new Error("nasa_images_empty");
    const meta = item.data[0]!;
    const previewUrl = item.links![0]!.href;

    const media: AstronomyMedia = {
      id: meta.nasa_id,
      title: meta.title,
      mediaType: "image",
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
    };
    return media;
  });

  if (snap.cacheHit === true) {
    logProvider({ provider: PROVIDER, event: "cache_hit" });
  } else {
    logProvider({ provider: PROVIDER, event: "ok", ms: elapsed() });
  }

  // cached() stamps provider: "cache"; the adapter owns its provider identity.
  return { ...snap, provider: PROVIDER };
}
