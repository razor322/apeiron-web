import type { AstronomyMedia, AstronomySnapshot } from "@/lib/astronomy/models";
import { ApodSchema } from "@/lib/astronomy/schemas/apod";
import { cached } from "@/lib/cache/ttl-cache";

// Current documented APOD source. The legacy /planetary/apod route is archived.
// Source doc: https://science.nasa.gov/apis/apod-api/ (WordPress REST route);
// gateway: https://api.nasa.gov/planetary/apod.
const APOD_BASE_URL = "https://api.nasa.gov/planetary/apod";
const APOD_PROVIDER = "nasa-apod";
const APOD_TTL_MS = 6 * 3600_000;

function buildUrl(): string {
  const key = process.env.NASA_API_KEY ?? "DEMO_KEY";
  const url = new URL(APOD_BASE_URL);
  url.searchParams.set("api_key", key);
  return url.toString();
}

async function fetchRaw(): Promise<AstronomyMedia> {
  const res = await fetch(buildUrl(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`apod_http_${res.status}`);
  const parsed = ApodSchema.parse(await res.json());
  return {
    id: parsed.date,
    title: parsed.title,
    mediaType: parsed.media_type,
    previewUrl: parsed.thumbnail_url ?? parsed.url,
    originalUrl: parsed.hdurl ?? parsed.url,
    sourceName: "NASA APOD",
    sourceUrl: parsed.hdurl ?? parsed.url,
    credit: parsed.copyright,
    altText: parsed.title,
    publishedAt: parsed.date,
    retrievedAt: new Date().toISOString(),
  };
}

// ponytail: cached() serves fresh entries without re-running the fetcher, so it
// cannot report a provider failure once an entry is warm. Keep the last real
// snapshot here to surface staleness; upgrade if cached gains stale-on-fresh.
let lastSnapshot: AstronomySnapshot<AstronomyMedia> | null = null;

export async function fetchApod(): Promise<AstronomySnapshot<AstronomyMedia>> {
  try {
    const media = await fetchRaw();
    await cached("apod", APOD_TTL_MS, async () => media);
    lastSnapshot = {
      data: media,
      provider: APOD_PROVIDER,
      sourceUrl: media.sourceUrl,
      retrievedAt: media.retrievedAt,
      stale: false,
    };
    return lastSnapshot;
  } catch (err) {
    if (lastSnapshot) return { ...lastSnapshot, stale: true };
    throw err;
  }
}
