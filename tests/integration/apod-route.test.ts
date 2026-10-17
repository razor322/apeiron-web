import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { GET } from "@/app/api/astronomy/apod/route";
import { resetApodState } from "@/lib/astronomy/providers/nasa-apod";
import { clearCache } from "@/lib/cache/ttl-cache";

const valid = {
  date: "2026-10-16",
  title: "Contoh",
  explanation: "Penjelasan.",
  media_type: "image",
  url: "https://example.org/a.jpg",
  hdurl: "https://example.org/a_hd.jpg",
};
beforeEach(() => {
  clearCache();
  resetApodState();
});
afterEach(() => vi.restoreAllMocks());

describe("GET /api/astronomy/apod", () => {
  it("returns 200 with the snapshot on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, headers: new Headers(), json: async () => [valid],
    }));
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("returns 429 when rate limited with no stored snapshot", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status: 429, headers: new Headers(), json: async () => ({}),
    }));
    const res = await GET();
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "rate_limited" });
  });

  it("returns 503 on a generic provider failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const res = await GET();
    expect(res.status).toBe(503);
  });
});
