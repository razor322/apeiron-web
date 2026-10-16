import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { ApodSchema } from "@/lib/astronomy/schemas/apod";
import { fetchApod, RateLimitError, resetApodState } from "@/lib/astronomy/providers/nasa-apod";
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

beforeEach(() => {
  clearCache();
  resetApodState();
});
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

describe("fetchApod rate limits", () => {
  it("throws RateLimitError on 429 when there is no prior snapshot", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status: 429, headers: new Headers(), json: async () => ({}),
    }));
    await expect(fetchApod()).rejects.toBeInstanceOf(RateLimitError);
  });

  it("leaves remaining undefined when the rate-limit header is non-numeric", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status: 429, headers: new Headers({ "x-ratelimit-remaining": "unknown" }), json: async () => ({}),
    }));
    const err = await fetchApod().catch((e) => e);
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).remaining).toBeUndefined();
  });

  it("treats 403 as a rate limit too", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status: 403, headers: new Headers(), json: async () => ({}),
    }));
    await expect(fetchApod()).rejects.toBeInstanceOf(RateLimitError);
  });

  it("falls back to the stored snapshot when rate limited after a prior success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, headers: new Headers(), json: async () => valid,
    }));
    await fetchApod();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status: 429, headers: new Headers({ "x-ratelimit-remaining": "0" }), json: async () => ({}),
    }));
    const snap = await fetchApod();
    expect(snap.stale).toBe(true);
  });

  it("does not throw when a successful response carries a rate-limit header", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, headers: new Headers({ "x-ratelimit-remaining": "998" }), json: async () => valid,
    }));
    const snap = await fetchApod();
    expect(snap.stale).toBe(false);
  });
});

describe("fetchApod logging", () => {
  it("logs ok with a duration on success", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, headers: new Headers(), json: async () => valid,
    }));
    await fetchApod();
    const logged = info.mock.calls.map((c) => String(c[0])).join("\n");
    expect(logged).toContain("provider=nasa-apod");
    expect(logged).toContain("event=ok");
    expect(logged).toContain("ms=");
  });
  it("logs rate_limited on 429", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    resetApodState();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status: 429, headers: new Headers(), json: async () => ({}),
    }));
    await expect(fetchApod()).rejects.toBeInstanceOf(RateLimitError);
    const logged = warn.mock.calls.map((c) => String(c[0])).join("\n");
    expect(logged).toContain("rate_limited");
  });
});
