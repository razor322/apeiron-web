import type { AstronomySnapshot } from "@/lib/astronomy/models";
import { ExoplanetRowsSchema, type ExoplanetRow } from "@/lib/astronomy/schemas/exoplanet";
import { ExoplanetCountSchema } from "@/lib/astronomy/schemas/exoplanet-count";
import { cached } from "@/lib/cache/ttl-cache";
import { logProvider, timeProvider } from "@/lib/astronomy/log";

// NASA Exoplanet Archive TAP (Caltech/IPAC). No API key. Sync endpoint returns
// JSON for a read-only ADQL query. Sourced: https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html
const TAP_BASE = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";
const PROVIDER = "exoplanet-archive";
const TTL_MS = 24 * 60 * 60 * 1000;

async function runQuery(query: string): Promise<unknown> {
  const url = new URL(TAP_BASE);
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");
  const elapsed = timeProvider();
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12000) });
  if (!res.ok) {
    logProvider({ provider: PROVIDER, event: "error", status: res.status });
    throw new Error(`exoplanet_http_${res.status}`);
  }
  logProvider({ provider: PROVIDER, event: "ok", ms: elapsed() });
  return res.json();
}

export async function fetchExoplanetCount(): Promise<number> {
  const key = `${PROVIDER}:count`;
  const snap = await cached<number>(key, TTL_MS, async () => {
    const body = await runQuery("select count(*) as n from ps");
    return ExoplanetCountSchema.parse(body)[0]!.n;
  });
  return snap.data;
}

// The most recently discovered confirmed planets, newest first.
export async function fetchRecentExoplanets(limit = 12): Promise<AstronomySnapshot<ExoplanetRow[]>> {
  const key = `${PROVIDER}:recent:${limit}`;
  const snap = await cached<ExoplanetRow[]>(key, TTL_MS, async () => {
    const query =
      "select top " +
      limit +
      " pl_name, hostname, disc_year, disc_facility, discoverymethod, pl_orbper, pl_rade " +
      "from ps order by disc_year desc";
    const body = await runQuery(query);
    return ExoplanetRowsSchema.parse(body);
  });
  return { ...snap, provider: PROVIDER };
}
