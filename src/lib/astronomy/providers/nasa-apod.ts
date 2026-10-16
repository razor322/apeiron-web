import type { AstronomyMedia, AstronomySnapshot } from "@/lib/astronomy/models";
import { ApodSchema } from "@/lib/astronomy/schemas/apod";

// Current documented APOD source. The legacy /planetary/apod route is archived.
// Source doc: https://science.nasa.gov/apis/apod-api/ (WordPress REST route);
// gateway: https://api.nasa.gov/planetary/apod.
const APOD_BASE_URL = "https://api.nasa.gov/planetary/apod";
const APOD_PROVIDER = "nasa-apod";

// A blocked key returns 403; an exhausted quota returns 429. Both mean "back off".
const RATE_LIMIT_STATUSES = new Set([429, 403]);

export class RateLimitError extends Error {
  constructor(
    public status: number,
    public remaining?: number,
  ) {
    super(`apod_rate_limited_${status}`);
    this.name = "RateLimitError";
  }
}

function buildUrl(): string {
  const key = process.env.NASA_API_KEY;
  if (!key) {
    console.warn("[apod] NASA_API_KEY not set, using DEMO_KEY (30 requests/hour).");
  }
  const url = new URL(APOD_BASE_URL);
  url.searchParams.set("api_key", key ?? "DEMO_KEY");
  return url.toString();
}

async function fetchRaw(): Promise<AstronomyMedia> {
  const res = await fetch(buildUrl(), { signal: AbortSignal.timeout(8000) });
  const remainingHeader = res.headers?.get("x-ratelimit-remaining") ?? null;
  const remaining = remainingHeader === null ? undefined : Number(remainingHeader);

  if (RATE_LIMIT_STATUSES.has(res.status)) {
    throw new RateLimitError(res.status, remaining);
  }
  if (!res.ok) throw new Error(`apod_http_${res.status}`);
  if (remaining !== undefined && remaining < 10) {
    console.warn(`[apod] rate limit nearly exhausted: ${remaining} remaining this hour.`);
  }

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
    explanation: parsed.explanation,
    publishedAt: parsed.date,
    retrievedAt: new Date().toISOString(),
  };
}

// ponytail: the page owns day-level freshness (ISR revalidate 6h in the
// cosmos-today route), so this adapter keeps only the last real snapshot to
// surface staleness when the provider fails or rate-limits. Add a real TTL store
// here if a second consumer needs sub-day caching.
let lastSnapshot: AstronomySnapshot<AstronomyMedia> | null = null;

// Test-only: reset the module-level fallback between cases.
export function resetApodState(): void {
  lastSnapshot = null;
}

export async function fetchApod(): Promise<AstronomySnapshot<AstronomyMedia>> {
  try {
    const media = await fetchRaw();
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
