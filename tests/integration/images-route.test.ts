import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { GET } from "@/app/api/astronomy/images/route";
import { clearCache } from "@/lib/cache/ttl-cache";

const valid = {
  collection: {
    items: [
      {
        data: [{ nasa_id: "PIA1", title: "Mars", description: "d" }],
        links: [{ href: "https://images-assets.nasa.gov/image/PIA1/PIA1~thumb.jpg" }],
      },
    ],
  },
};

beforeEach(() => clearCache());
afterEach(() => vi.restoreAllMocks());

function req(q?: string) {
  return new Request(`https://x/api/astronomy/images${q ? `?q=${q}` : ""}`);
}

describe("GET /api/astronomy/images", () => {
  it("returns 400 without a query", async () => {
    const res = await GET(req());
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "missing_query" });
  });
  it("returns 200 with the snapshot for a valid query", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, status: 200, headers: new Headers(), json: async () => valid,
    }));
    const res = await GET(req("mars"));
    expect(res.status).toBe(200);
  });
  it("returns 503 when the provider fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const res = await GET(req("mars"));
    expect(res.status).toBe(503);
  });
  it("returns 429 when the provider rate limits", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status: 429, headers: new Headers(), json: async () => ({}),
    }));
    const res = await GET(req("mars"));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "rate_limited" });
  });
});
