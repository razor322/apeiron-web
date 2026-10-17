import type { AstronomySnapshot } from "@/lib/astronomy/models";
import type { NearEarthObject } from "@/lib/astronomy/models/neo";
import { CadSchema } from "@/lib/astronomy/schemas/cad";
import { cached } from "@/lib/cache/ttl-cache";
import { logProvider, timeProvider } from "@/lib/astronomy/log";

// JPL CNEOS Close-Approach Data (cad.api). No API key; fair-use policy applies
// (cache and a modest limit). Source: https://ssd-api.jpl.nasa.gov/doc/cad.html
const CAD_BASE = "https://ssd-api.jpl.nasa.gov/cad.api";
const PROVIDER = "jpl-cad";
const TTL_MS = 12 * 60 * 60 * 1000;

function column(fields: string[], row: (string | number)[], name: string): string | undefined {
  const i = fields.indexOf(name);
  if (i < 0) return undefined;
  const v = row[i];
  return v === undefined ? undefined : String(v);
}

export async function fetchNearEarth(limit = 8): Promise<AstronomySnapshot<NearEarthObject[]>> {
  const key = `${PROVIDER}:${limit}`;
  const snap = await cached<NearEarthObject[]>(key, TTL_MS, async () => {
    const url = new URL(CAD_BASE);
    url.searchParams.set("date-min", "now");
    url.searchParams.set("date-max", "+60");
    url.searchParams.set("dist-max", "0.1"); // within ~0.1 au for a short, relevant list
    url.searchParams.set("limit", String(limit));
    const elapsed = timeProvider();
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      logProvider({ provider: PROVIDER, event: "error", status: res.status });
      throw new Error(`cad_http_${res.status}`);
    }
    logProvider({ provider: PROVIDER, event: "ok", ms: elapsed() });
    const parsed = CadSchema.parse(await res.json());
    return parsed.data.map((row) => {
      const des = column(parsed.fields, row, "des") ?? "unknown";
      return {
        designation: des,
        approachDate: column(parsed.fields, row, "cd") ?? "",
        distanceAu: Number(column(parsed.fields, row, "dist")),
        velocityKms: Number(column(parsed.fields, row, "v_rel")),
        magnitude: Number(column(parsed.fields, row, "h")) || undefined,
        sourceUrl: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${encodeURIComponent(des)}`,
      } satisfies NearEarthObject;
    });
  });
  return { ...snap, provider: PROVIDER };
}
