import { describe, it, expect } from "vitest";
import { exponentAtProgress, MAX_EXPONENT } from "@/features/cosmic-journey/exponent";

describe("exponentAtProgress", () => {
  it("starts at a person and ends at the observable universe", () => {
    expect(exponentAtProgress(0)).toBeCloseTo(0.3, 1);
    expect(exponentAtProgress(1)).toBeCloseTo(MAX_EXPONENT, 1);
  });

  it("opens onto Earth's orbit before the surface, then descends to it", () => {
    const orbitPeak = exponentAtProgress(0.24);
    const surface = exponentAtProgress(0.3);
    expect(orbitPeak).toBeGreaterThan(surface);
    expect(surface).toBeLessThan(8);
  });

  it("never decreases across the whole range above the orbit peak", () => {
    let last = -1;
    for (let p = 0.35; p <= 1; p += 0.02) {
      const e = exponentAtProgress(p);
      expect(e).toBeGreaterThanOrEqual(last - 0.001);
      last = e;
    }
  });
});
