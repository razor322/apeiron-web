import { describe, it, expect } from "vitest";
import {
  exponentAtProgress,
  progressAtExponent,
  MAX_EXPONENT,
} from "@/features/cosmic-journey/exponent";

describe("exponentAtProgress", () => {
  it("starts near a person and ends at the observable universe", () => {
    expect(exponentAtProgress(0)).toBeCloseTo(0.3, 1);
    expect(exponentAtProgress(1)).toBeCloseTo(MAX_EXPONENT, 1);
  });

  it("never decreases across the whole range", () => {
    let last = -1;
    for (let p = 0; p <= 1; p += 0.01) {
      const e = exponentAtProgress(p);
      expect(e).toBeGreaterThanOrEqual(last - 0.001);
      last = e;
    }
  });

  it("passes through the Earth surface scale without an orbit dip", () => {
    // The Earth stage sits at the surface scale, roughly 7.2. With the dip
    // removed there is no point above it that the curve returns to after.
    expect(exponentAtProgress(0.3)).toBeLessThan(8);
    expect(exponentAtProgress(0.3)).toBeGreaterThan(6);
    expect(exponentAtProgress(0.35)).toBeGreaterThanOrEqual(exponentAtProgress(0.3) - 0.001);
  });
});

describe("progressAtExponent", () => {
  it("returns a progress below the universe and above the Earth surface", () => {
    expect(progressAtExponent(16)).toBeLessThan(progressAtExponent(27));
    expect(progressAtExponent(16)).toBeGreaterThan(progressAtExponent(7));
  });
});
