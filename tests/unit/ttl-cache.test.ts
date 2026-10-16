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
});
