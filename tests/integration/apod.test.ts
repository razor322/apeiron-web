import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { ApodSchema } from "@/lib/astronomy/schemas/apod";
import { fetchApod } from "@/lib/astronomy/providers/nasa-apod";
import { clearCache } from "@/lib/cache/ttl-cache";

const valid = {
  date: "2026-10-14",
  title: "Contoh",
  explanation: "Penjelasan.",
  media_type: "image",
  url: "https://example.org/a.jpg",
  hdurl: "https://example.org/a_hd.jpg",
  copyright: "Someone",
};

beforeEach(() => clearCache());
afterEach(() => vi.restoreAllMocks());

describe("ApodSchema", () => {
  it("accepts a valid payload", () => {
    expect(ApodSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects a payload without a url", () => {
    const bad: Record<string, unknown> = { ...valid };
    delete bad.url;
    expect(ApodSchema.safeParse(bad).success).toBe(false);
  });
});

describe("fetchApod", () => {
  it("maps a valid response to AstronomyMedia with provenance", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => valid,
    }));
    const snap = await fetchApod();
    expect(snap.data.mediaType).toBe("image");
    expect(snap.data.sourceName).toBeTruthy();
    expect(snap.data.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(snap.stale).toBe(false);
  });

  it("marks the snapshot stale when the provider fails after a prior success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => valid }));
    await fetchApod();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const snap = await fetchApod();
    expect(snap.stale).toBe(true);
  });
});
