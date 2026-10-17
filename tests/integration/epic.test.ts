import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { fetchEarthToday } from "@/lib/astronomy/providers/epic";
import { EpicImagesSchema } from "@/lib/astronomy/schemas/epic";
import { clearCache } from "@/lib/cache/ttl-cache";

const payload = [
  { identifier: "x", image: "epic_1b_20261014001752", date: "2026-10-14 00:13:03", caption: "Earth." },
];

beforeEach(() => clearCache());
afterEach(() => vi.restoreAllMocks());

describe("EpicImagesSchema", () => {
  it("accepts the list payload", () => {
    expect(EpicImagesSchema.safeParse(payload).success).toBe(true);
  });
  it("rejects an item without an image id", () => {
    expect(EpicImagesSchema.safeParse([{ date: "2026-10-14" }]).success).toBe(false);
  });
});

describe("fetchEarthToday", () => {
  it("derives the archive image URL from the date and id", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => payload,
    }));
    const media = await fetchEarthToday(6);
    expect(media[0]!.previewUrl).toContain("/archive/natural/2026/10/14/png/epic_1b_20261014001752.png");
    expect(media[0]!.credit).toContain("DSCOVR");
  });

  it("throws when EPIC fails with no cache", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }));
    await expect(fetchEarthToday(6)).rejects.toThrow(/epic_http_503/);
  });
});
