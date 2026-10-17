import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { fetchExoplanetCount, fetchRecentExoplanets } from "@/lib/astronomy/providers/exoplanet";
import { ExoplanetRowsSchema } from "@/lib/astronomy/schemas/exoplanet";
import { clearCache } from "@/lib/cache/ttl-cache";

const rows = [
  {
    pl_name: "WASP-39 b",
    hostname: "WASP-39",
    disc_year: 2011,
    disc_facility: "SuperWASP",
    discoverymethod: "Transit",
    pl_orbper: 4.055259,
    pl_rade: 14.235,
  },
  {
    pl_name: "GJ 436 b",
    hostname: "GJ 436",
    disc_year: 2004,
    disc_facility: "Spitzer",
    discoverymethod: "Radial Velocity",
    pl_orbper: 2.64,
    pl_rade: 4.19,
  },
];

beforeEach(() => clearCache());
afterEach(() => vi.restoreAllMocks());

describe("ExoplanetRowsSchema", () => {
  it("accepts an array of archive rows", () => {
    expect(ExoplanetRowsSchema.safeParse(rows).success).toBe(true);
  });
  it("rejects a row without a name", () => {
    expect(ExoplanetRowsSchema.safeParse([{ disc_year: 2011 }]).success).toBe(false);
  });
});

describe("fetchExoplanetCount", () => {
  it("returns the count from the archive", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => [{ n: 40350 }],
    }));
    expect(await fetchExoplanetCount()).toBe(40350);
  });
});

describe("fetchRecentExoplanets", () => {
  it("maps rows and marks the provider", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => rows,
    }));
    const snap = await fetchRecentExoplanets(12);
    expect(snap.provider).toBe("exoplanet-archive");
    expect(snap.data[0]!.pl_name).toBe("WASP-39 b");
    expect(snap.stale).toBe(false);
  });

  it("throws when the archive fails with no cached value", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }));
    await expect(fetchRecentExoplanets(12)).rejects.toThrow(/exoplanet_http_503/);
  });

  it("serves a cached list on a second call without refetching", async () => {
    const spy = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => rows });
    vi.stubGlobal("fetch", spy);
    await fetchRecentExoplanets(12);
    await fetchRecentExoplanets(12);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
