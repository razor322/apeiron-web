import type { AstronomyMedia } from "@/lib/astronomy/models";
import { EpicImagesSchema, type EpicImage } from "@/lib/astronomy/schemas/epic";
import { cached } from "@/lib/cache/ttl-cache";
import { logProvider, timeProvider } from "@/lib/astronomy/log";

// NASA EPIC (Earth Polychromatic Imaging Camera), natural-colour Earth images
// from the DSCOVR spacecraft at L1. Requires the app API key. Source:
// https://epic.gsfc.nasa.gov/about/api
const EPIC_BASE = "https://api.nasa.gov/EPIC";
const PROVIDER = "nasa-epic";
const TTL_MS = 6 * 60 * 60 * 1000;

function buildUrl(): string {
  const key = process.env.NASA_API_KEY ?? "DEMO_KEY";
  const url = new URL(`${EPIC_BASE}/api/natural`);
  url.searchParams.set("api_key", key);
  return url.toString();
}

// The archive URL is derived from the capture date, not returned by the list.
function archiveUrl(meta: EpicImage): string {
  const d = new Date(meta.date.replace(" ", "T") + "Z");
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const key = process.env.NASA_API_KEY ?? "DEMO_KEY";
  return `${EPIC_BASE}/archive/natural/${yyyy}/${mm}/${dd}/png/${meta.image}.png?api_key=${key}`;
}

export async function fetchEarthToday(limit = 6): Promise<AstronomyMedia[]> {
  const key = `${PROVIDER}:${limit}`;
  const snap = await cached<AstronomyMedia[]>(key, TTL_MS, async () => {
    const elapsed = timeProvider();
    const res = await fetch(buildUrl(), { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      logProvider({ provider: PROVIDER, event: "error", status: res.status });
      throw new Error(`epic_http_${res.status}`);
    }
    logProvider({ provider: PROVIDER, event: "ok", ms: elapsed() });
    const parsed = EpicImagesSchema.parse(await res.json());
    return parsed.slice(0, limit).map((meta) => {
      const url = archiveUrl(meta);
      return {
        id: meta.image,
        title: meta.date,
        mediaType: "image" as const,
        previewUrl: url,
        originalUrl: url,
        sourceName: "NASA EPIC",
        sourceUrl: "https://epic.gsfc.nasa.gov/",
        credit: "NASA/EPIC/DSCOVR",
        rightsNote: "NASA material is generally not copyrighted.",
        altText: `Earth seen from the DSCOVR spacecraft on ${meta.date} UTC.`,
        explanation: meta.caption,
        publishedAt: meta.date,
        retrievedAt: new Date().toISOString(),
      } satisfies AstronomyMedia;
    });
  });
  return snap.data;
}
