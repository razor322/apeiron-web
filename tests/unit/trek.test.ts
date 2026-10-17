import { describe, it, expect } from "vitest";
import { TREK_LAYERS, trekTileUrl, trekGrid } from "@/lib/astronomy/providers/trek";

describe("trek", () => {
  it("builds a tile URL with z, y, x substituted", () => {
    expect(trekTileUrl(TREK_LAYERS.mars, 1, 0, 1)).toContain("/1/0/1.jpg");
    expect(trekTileUrl(TREK_LAYERS.mars, 1, 0, 1)).not.toContain("{");
  });
  it("has moon and mars layers with provenance", () => {
    for (const layer of Object.values(TREK_LAYERS)) {
      expect(layer.credit).toContain("NASA");
      expect(layer.sourceUrl).toMatch(/^https:\/\/trek\.nasa\.gov\//);
    }
  });
  it("returns a 2x2 grid of tiles", () => {
    const { tiles } = trekGrid(TREK_LAYERS.moon);
    expect(tiles).toHaveLength(4);
    expect(tiles.every((t) => t.url.startsWith("https://"))).toBe(true);
  });
});
