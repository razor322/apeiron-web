import { describe, it, expect } from "vitest";
import {
  asteroidCounts,
  beltRadius,
  beltSize,
  keplerianSpeed,
  sampleBelt,
  variantCounts,
  SIZE_MIN,
  SIZE_MAX,
} from "@/features/solar-system-3d/asteroid-belt";
import { SCALE } from "@/features/solar-system-3d/solar-system.data";

describe("asteroidCounts", () => {
  it("matches the tier instance counts", () => {
    expect(asteroidCounts("high")).toBe(6000);
    expect(asteroidCounts("medium")).toBe(3000);
    expect(asteroidCounts("low")).toBe(1500);
  });
});

describe("beltRadius", () => {
  it("stays within the belt band for every sample", () => {
    for (let i = 0; i < 1; i += 0.001) {
      const r = beltRadius(i);
      expect(r).toBeGreaterThanOrEqual(SCALE.beltInner);
      expect(r).toBeLessThanOrEqual(SCALE.beltOuter);
    }
  });

  it("is denser near the band centre than at the band edges", () => {
    const centre = (SCALE.beltInner + SCALE.beltOuter) / 2;
    const n = 20000;
    let near = 0;
    let edges = 0;
    for (let i = 0; i < n; i += 1) {
      const t = (i + 0.5) / n;
      const r = beltRadius(t);
      if (Math.abs(r - centre) < 1) near += 1;
      else if (r < SCALE.beltInner + 1 || r > SCALE.beltOuter - 1) edges += 1;
    }
    expect(near).toBeGreaterThan(edges);
  });
});

describe("beltSize", () => {
  it("sampled sizes fall inside [SIZE_MIN, SIZE_MAX]", () => {
    for (let i = 0; i < 1; i += 0.001) {
      const s = beltSize(i);
      expect(s).toBeGreaterThanOrEqual(SIZE_MIN - 1e-9);
      expect(s).toBeLessThanOrEqual(SIZE_MAX + 1e-9);
    }
  });

  it("follows a power law: more small rocks than large", () => {
    const n = 20000;
    const mid = (SIZE_MIN + SIZE_MAX) / 2;
    let small = 0;
    let large = 0;
    for (let i = 0; i < n; i += 1) {
      const s = beltSize((i + 0.5) / n);
      if (s < mid) small += 1;
      else large += 1;
    }
    expect(small).toBeGreaterThan(large * 2);
  });
});

describe("keplerianSpeed", () => {
  it("decreases with radius, proportional to r^-1.5", () => {
    const a = keplerianSpeed(15);
    const b = keplerianSpeed(30);
    expect(b).toBeLessThan(a);
    expect(a / b).toBeCloseTo((30 / 15) ** 1.5, 6);
  });
});

describe("sampleBelt", () => {
  it("produces one variant's instance data within the band and scatter", () => {
    const data = sampleBelt("low");
    const capacity = variantCounts(asteroidCounts("high"))[0]!;
    expect(data.radius).toHaveLength(capacity);
    expect(data.angle).toHaveLength(capacity);
    expect(data.y).toHaveLength(capacity);
    expect(data.size).toHaveLength(capacity);
    for (let i = 0; i < data.radius.length; i += 1) {
      expect(data.radius[i]!).toBeGreaterThanOrEqual(SCALE.beltInner);
      expect(data.radius[i]!).toBeLessThanOrEqual(SCALE.beltOuter);
      expect(Math.abs(data.y[i]!)).toBeLessThanOrEqual(Math.tan((6 * Math.PI) / 180) * data.radius[i]! + 1e-6);
    }
  });
});
