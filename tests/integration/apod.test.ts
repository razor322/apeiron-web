import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { ApodSchema } from "@/lib/astronomy/schemas/apod";
import { fetchApod, RateLimitError, resetApodState } from "@/lib/astronomy/providers/nasa-apod";
import { clearCache } from "@/lib/cache/ttl-cache";

// science.nasa.gov APOD feed item (image day): hdurl is the direct image, and
// explanation/credit/alt arrive as markup-bearing strings.
const imageItem = {
  date: "2026-10-15",
  title: "The Milky Way over Manhattan",
  explanation: "<strong>Explanation:</strong> A <a href=\"https://x\">view</a> of the sky &amp; stars.",
  media_type: "image",
  url: "https://science.nasa.gov/image-article/apod-2026-october-15/",
  hdurl: "https://assets.science.nasa.gov/dynamicimage/Manhattan.jpg",
  credit: "<a href=\"https://instagram.com/x\">Jason Kurth</a>",
  alt: "The Manhattan skyline under a faint Milky Way.",
};

// Video day: hdurl is empty, so the provider must fall back to the permalink.
const videoItem = {
  date: "2026-10-16",
  title: "Chasing the International Space Station",
  explanation: "<strong>Explanation:</strong> A timelapse.",
  media_type: "video",
  url: "https://science.nasa.gov/image-article/apod-2026-october-16/",
  hdurl: "",
  credit: "",
  copyright: "<a href=\"https://x\">Eric Holland</a>",
  alt: "Video of a rocket launch.",
};

beforeEach(() => {
  clearCache();
  resetApodState();
});
afterEach(() => vi.restoreAllMocks());

describe("ApodSchema", () => {
  it("accepts a valid feed item", () => {
    expect(ApodSchema.safeParse(imageItem).success).toBe(true);
  });
  it("accepts an empty hdurl (video day)", () => {
    expect(ApodSchema.safeParse(videoItem).success).toBe(true);
  });
  it("rejects a payload without a url", () => {
    const bad: Record<string, unknown> = { ...imageItem };
    delete bad.url;
    expect(ApodSchema.safeParse(bad).success).toBe(false);
  });
});

describe("fetchApod", () => {
  it("maps a valid image-day response to AstronomyMedia with provenance", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => [imageItem],
    }));
    const snap = await fetchApod();
    expect(snap.data.mediaType).toBe("image");
    expect(snap.data.previewUrl).toBe(imageItem.hdurl);
    expect(snap.data.sourceName).toBeTruthy();
    expect(snap.data.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(snap.stale).toBe(false);
  });

  it("strips HTML from the explanation and credit", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => [imageItem],
    }));
    const snap = await fetchApod();
    expect(snap.data.explanation).not.toContain("<");
    expect(snap.data.explanation).toContain("view of the sky & stars");
    expect(snap.data.credit).toBe("Jason Kurth");
  });

  it("falls back to the permalink when hdurl is empty (video day)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => [videoItem],
    }));
    const snap = await fetchApod();
    expect(snap.data.mediaType).toBe("video");
    expect(snap.data.originalUrl).toBe(videoItem.url);
    expect(snap.data.credit).toBe("Eric Holland");
  });

  it("marks the snapshot stale when the provider fails after a prior success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [imageItem] }));
    await fetchApod();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const snap = await fetchApod();
    expect(snap.stale).toBe(true);
  });

  it("throws RateLimitError on 429 with no prior snapshot", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status: 429, json: async () => ({}),
    }));
    await expect(fetchApod()).rejects.toBeInstanceOf(RateLimitError);
  });

  it("logs ok with a duration on success", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => [imageItem],
    }));
    await fetchApod();
    const logged = info.mock.calls.map((c) => String(c[0])).join("\n");
    expect(logged).toContain("provider=nasa-apod");
    expect(logged).toContain("event=ok");
    expect(logged).toContain("ms=");
  });
});
