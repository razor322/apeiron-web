import { describe, it, expect, vi, beforeEach } from "vitest";
import { cached, clearCache } from "@/lib/cache/ttl-cache";

beforeEach(() => clearCache());

describe("cached", () => {
  it("returns fresh data and caches it within TTL", async () => {
    const fetcher = vi.fn().mockResolvedValue({ v: 1 });
    const a = await cached("k", 1000, fetcher);
    const b = await cached("k", 1000, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(a.stale).toBe(false);
    expect(b.data).toEqual({ v: 1 });
  });

  it("serves stale data when the fetcher fails", async () => {
    await cached("k", 0, async () => ({ v: 1 }));
    const fetcher = vi.fn().mockRejectedValue(new Error("boom"));
    const res = await cached("k", 0, fetcher);
    expect(res.stale).toBe(true);
    expect(res.data).toEqual({ v: 1 });
  });

  it("throws when there is no cached fallback", async () => {
    await expect(cached("n", 0, async () => { throw new Error("x"); })).rejects.toThrow("x");
  });

  it("marks the first fetch as a cache miss", async () => {
    clearCache();
    const snap = await cached("k", 1000, async () => "v");
    expect(snap.cacheHit).toBe(false);
  });
  it("marks a served-from-store result as a cache hit", async () => {
    clearCache();
    await cached("k2", 1000, async () => "v");
    let calls = 0;
    const snap = await cached("k2", 1000, async () => { calls++; return "v2"; });
    expect(snap.cacheHit).toBe(true);
    expect(calls).toBe(0);
  });
  it("marks a stale fallback as a cache hit", async () => {
    clearCache();
    await cached("k3", 1, async () => "v");
    await new Promise((r) => setTimeout(r, 5));
    const snap = await cached("k3", 1, async () => { throw new Error("down"); });
    expect(snap.cacheHit).toBe(true);
    expect(snap.stale).toBe(true);
  });
});
