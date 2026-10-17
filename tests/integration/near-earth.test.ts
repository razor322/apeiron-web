import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { fetchNearEarth } from "@/lib/astronomy/providers/near-earth";
import { CadSchema } from "@/lib/astronomy/schemas/cad";
import { clearCache } from "@/lib/cache/ttl-cache";

const payload = {
  fields: ["des", "cd", "dist", "v_rel", "h"],
  data: [
    ["2026 RO3", "2026-Oct-17 03:13", "0.0886538916", "3.7451", "25.385"],
    ["2026 TS", "2026-Oct-18 06:16", "0.05", "12.1", "22.0"],
  ],
  count: "2",
};

beforeEach(() => clearCache());
afterEach(() => vi.restoreAllMocks());

describe("CadSchema", () => {
  it("accepts the columnar payload", () => {
    expect(CadSchema.safeParse(payload).success).toBe(true);
  });
  it("rejects a payload without fields", () => {
    expect(CadSchema.safeParse({ data: [] }).success).toBe(false);
  });
});

describe("fetchNearEarth", () => {
  it("maps rows to NearEarthObject with provenance", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => payload,
    }));
    const snap = await fetchNearEarth(8);
    expect(snap.provider).toBe("jpl-cad");
    const first = snap.data[0]!;
    expect(first.designation).toBe("2026 RO3");
    expect(first.distanceAu).toBeCloseTo(0.0886, 3);
    expect(first.velocityKms).toBeCloseTo(3.7451, 3);
    expect(first.sourceUrl).toContain("2026%20RO3");
  });

  it("throws when JPL fails with no cache", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }));
    await expect(fetchNearEarth(8)).rejects.toThrow(/cad_http_503/);
  });
});
