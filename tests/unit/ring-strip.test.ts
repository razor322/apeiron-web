import { describe, expect, it } from "vitest";
import { sampleRingStrip } from "@/features/solar-system-3d/shaderstrips";

// The ring table is a function of normalized radius u (0 = inner edge, 1 =
// outer edge). These assertions pin the bands the brief names: ring B is
// nearly opaque, the Cassini division is a near empty gap, and ring A carries
// a local dip for the Encke gap.

describe("sampleRingStrip", () => {
  it("returns rgb in 0..1 and alpha in 0..1 across the strip", () => {
    for (let i = 0; i <= 200; i += 1) {
      const { rgb, alpha } = sampleRingStrip("saturn", i / 200);
      for (const c of rgb) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(1);
      }
      expect(alpha).toBeGreaterThanOrEqual(0);
      expect(alpha).toBeLessThanOrEqual(1);
    }
  });

  it("keeps ring B nearly opaque and the Cassini gap nearly empty", () => {
    // Ring B sits just inside the Cassini division, roughly mid strip.
    const b = sampleRingStrip("saturn", 0.5);
    expect(b.alpha).toBeGreaterThan(0.85);

    // The Cassini division is a narrow dark band between B and A.
    const cassini = sampleRingStrip("saturn", 0.68);
    expect(cassini.alpha).toBeLessThan(0.1);
  });

  it("dips inside ring A for the Encke gap", () => {
    // A sample on the ring A plateau, and one in the Encke gap near its outer
    // edge. The gap alpha must be a local dip below the surrounding plateau.
    const plateau = sampleRingStrip("saturn", 0.8).alpha;
    const encke = sampleRingStrip("saturn", 0.88).alpha;
    expect(encke).toBeLessThan(plateau);
    expect(plateau).toBeGreaterThan(0.5);
  });

  it("is a pure function of u with the same output for repeat calls", () => {
    for (const kind of ["saturn", "uranus", "neptune"] as const) {
      const a = sampleRingStrip(kind, 0.37);
      const b = sampleRingStrip(kind, 0.37);
      expect(a).toEqual(b);
    }
  });

  it("gives Uranus and Neptune faint, low alpha rings", () => {
    for (const kind of ["uranus", "neptune"] as const) {
      let max = 0;
      for (let i = 0; i <= 100; i += 1) {
        max = Math.max(max, sampleRingStrip(kind, i / 100).alpha);
      }
      expect(max).toBeLessThan(0.85);
      expect(max).toBeGreaterThan(0);
    }
  });
});
