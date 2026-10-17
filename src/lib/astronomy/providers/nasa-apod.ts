import type { AstronomyMedia, AstronomySnapshot } from "@/lib/astronomy/models";
import { ApodSchema, type ApodData } from "@/lib/astronomy/schemas/apod";
import { logProvider, timeProvider } from "@/lib/astronomy/log";

// science.nasa.gov SMD APOD feed (the documented current source). No API key and
// no per-key rate limit; the plain api.nasa.gov gateway this project used before
// proved unreliable (intermittent 500s and invalid-key 403s), so the feed is the
// single source. See docs/APOD-APIs-and-RSS-info.md.
const APOD_BASE_URL = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";
const APOD_PROVIDER = "nasa-apod";

// A blocked gateway or an upstream throttle can still surface as 429/403; treat
// both as "back off" and let the caller fall back to the stored snapshot.
const RATE_LIMIT_STATUSES = new Set([429, 403]);

export class RateLimitError extends Error {
  constructor(public status: number) {
    super(`apod_rate_limited_${status}`);
    this.name = "RateLimitError";
  }
}

// Strip HTML tags and decode the few entities the feed emits, so the mapped
// strings are plain text for the UI (the feed returns explanation/credit/alt as
// markup-bearing strings).
function plainText(input: string | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildUrl(perPage: number): string {
  const url = new URL(APOD_BASE_URL);
  url.searchParams.set("per_page", String(perPage));
  return url.toString();
}

function mapItem(parsed: ApodData): AstronomyMedia {
  // hdurl is the direct image for image days, empty for video days; fall back to
  // the article permalink so a video day still links somewhere real.
  const mediaUrl = parsed.hdurl && parsed.hdurl.length > 0 ? parsed.hdurl : parsed.url;
  const credit = plainText(parsed.credit) || plainText(parsed.copyright);
  return {
    id: parsed.date,
    title: parsed.title,
    mediaType: parsed.media_type,
    previewUrl: mediaUrl,
    originalUrl: mediaUrl,
    sourceName: "NASA APOD",
    sourceUrl: parsed.url,
    credit: credit || undefined,
    altText: plainText(parsed.alt) || parsed.title,
    explanation: plainText(parsed.explanation),
    publishedAt: parsed.date,
    retrievedAt: new Date().toISOString(),
  };
}

async function fetchItems(perPage: number): Promise<AstronomyMedia[]> {
  const elapsed = timeProvider();
  const res = await fetch(buildUrl(perPage), { signal: AbortSignal.timeout(8000) });

  if (RATE_LIMIT_STATUSES.has(res.status)) {
    logProvider({ provider: APOD_PROVIDER, event: "rate_limited", status: res.status, errorClass: "RateLimitError" });
    throw new RateLimitError(res.status);
  }
  if (!res.ok) {
    logProvider({ provider: APOD_PROVIDER, event: "error", status: res.status });
    throw new Error(`apod_http_${res.status}`);
  }

  const body: unknown = await res.json();
  const rows = Array.isArray(body) ? body : [body];
  const parsed = rows.map((row) => ApodSchema.safeParse(row)).filter((r) => r.success);
  if (parsed.length === 0) throw new Error("apod_empty");

  logProvider({ provider: APOD_PROVIDER, event: "ok", ms: elapsed() });
  return parsed.map((r) => mapItem(r.data));
}

async function fetchRaw(): Promise<AstronomyMedia> {
  const items = await fetchItems(1);
  return items[0]!;
}

// ponytail: the page owns day-level freshness (ISR revalidate 6h in the
// cosmos-today route), so this adapter keeps only the last real snapshot to
// surface staleness when the provider fails. Add a real TTL store here if a
// second consumer needs sub-day caching.
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

// A list of recent APOD items, newest first (the feed returns them in date order).
// Falls back to the last single snapshot when the feed is unreachable, so the
// page keeps showing something rather than an empty list.
export async function fetchApodList(
  limit = 12,
): Promise<AstronomySnapshot<AstronomyMedia[]>> {
  try {
    const items = await fetchItems(limit);
    lastSnapshot = {
      data: items[0]!,
      provider: APOD_PROVIDER,
      sourceUrl: items[0]!.sourceUrl,
      retrievedAt: new Date().toISOString(),
      stale: false,
    };
    return {
      data: items,
      provider: APOD_PROVIDER,
      sourceUrl: items[0]!.sourceUrl,
      retrievedAt: new Date().toISOString(),
      stale: false,
    };
  } catch (err) {
    if (lastSnapshot) {
      return {
        data: [lastSnapshot.data],
        provider: APOD_PROVIDER,
        sourceUrl: lastSnapshot.sourceUrl,
        retrievedAt: lastSnapshot.retrievedAt,
        stale: true,
      };
    }
    throw err;
  }
}
