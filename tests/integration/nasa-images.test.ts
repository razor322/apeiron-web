import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { NasaImagesSchema } from "@/lib/astronomy/schemas/nasa-images";
import { searchNasaImage } from "@/lib/astronomy/providers/nasa-images";
import { clearCache } from "@/lib/cache/ttl-cache";

const valid = {
  collection: {
    items: [
      {
        href: "https://images-api.nasa.gov/search",
        data: [
          {
            nasa_id: "PIA00001",
            title: "Mars globe",
            description: "A globe of Mars.",
            date_created: "2001-01-01T00:00:00Z",
            center: "JPL",
          },
        ],
        links: [{ href: "https://images-assets.nasa.gov/image/PIA00001/PIA00001~thumb.jpg" }],
      },
    ],
  },
};

beforeEach(() => clearCache());
afterEach(() => vi.restoreAllMocks());

describe("NasaImagesSchema", () => {
  it("accepts a valid search payload", () => {
    expect(NasaImagesSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects a payload without a collection", () => {
    expect(NasaImagesSchema.safeParse({}).success).toBe(false);
  });
});

describe("searchNasaImage", () => {
  it("maps the first item to AstronomyMedia with provenance", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => valid,
    }));
    const snap = await searchNasaImage("mars");
    expect(snap.data.id).toBe("PIA00001");
    expect(snap.data.previewUrl).toContain("PIA00001");
    expect(snap.data.sourceName).toBe("NASA Image and Video Library");
    expect(snap.provider).toBe("nasa-images");
    expect(snap.data.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("throws when the provider returns an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }));
    await expect(searchNasaImage("mars")).rejects.toThrow(/nasa_images_http_503/);
  });
});

describe("searchNasaImage logging", () => {
  it("logs a cache miss then an ok event on first call, cache hit on second", async () => {
    clearCache();
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, headers: new Headers(), json: async () => valid,
    }));
    await searchNasaImage("mars");
    await searchNasaImage("mars");
    const lines = info.mock.calls.map((c) => String(c[0]));
    expect(lines.some((l) => l.includes("cache_miss"))).toBe(true);
    expect(lines.some((l) => l.includes("cache_hit"))).toBe(true);
    expect(lines.some((l) => l.includes("ms="))).toBe(true);
  });
});
