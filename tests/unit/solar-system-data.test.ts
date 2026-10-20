import { describe, it, expect } from "vitest";
import {
  BODIES,
  SCALE,
  compressRadius,
  bodyById,
  type BodyId,
} from "@/features/solar-system-3d/solar-system.data";

describe("SCALE", () => {
  it("carries the spec scene constants", () => {
    expect(SCALE).toEqual({
      sunRadius: 3.5,
      earthRadius: 0.5,
      beltInner: 15,
      beltOuter: 19,
      kuiperInner: 47,
      kuiperOuter: 58,
    });
  });
});

describe("compressRadius", () => {
  it("maps the Earth radius to 0.5", () => {
    expect(compressRadius(6_371_000)).toBeCloseTo(0.5, 6);
  });
  it("is monotonic", () => {
    const xs = [1e5, 1e6, 6.371e6, 1e7, 1e8, 7e9];
    for (let i = 1; i < xs.length; i += 1) {
      expect(compressRadius(xs[i] as number)).toBeGreaterThan(
        compressRadius(xs[i - 1] as number),
      );
    }
  });
  it("follows 0.5 * sqrt(real / earth)", () => {
    expect(compressRadius(4 * 6_371_000)).toBeCloseTo(1.0, 6);
  });
});

describe("BODIES", () => {
  it("has 11 bodies: Sun plus ten, including Ceres and Pluto", () => {
    expect(BODIES).toHaveLength(11);
    const ids = BODIES.map((b) => b.id);
    expect(ids).toEqual([
      "sun",
      "mercury",
      "venus",
      "earth",
      "mars",
      "ceres",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
      "pluto",
    ]);
  });

  it("gives the Sun a null orbit and no orbit period", () => {
    const sun = bodyById("sun");
    expect(sun?.orbitRadius).toBeNull();
    expect(sun?.orbitPeriod).toBeNull();
  });

  it("has strictly increasing orbit radii from Mercury to Pluto", () => {
    const orbiting = BODIES.filter(
      (b): b is (typeof BODIES)[number] & { orbitRadius: number } =>
        typeof b.orbitRadius === "number",
    );
    expect(orbiting).toHaveLength(10);
    for (let i = 1; i < orbiting.length; i += 1) {
      expect(orbiting[i]!.orbitRadius).toBeGreaterThan(
        orbiting[i - 1]!.orbitRadius,
      );
    }
  });

  it("flags retrograde spin for Venus, Uranus and Pluto only", () => {
    const retro = BODIES.filter((b) => b.spinRetrograde).map((b) => b.id);
    expect(retro.sort()).toEqual(["pluto", "uranus", "venus"]);
  });

  it("gives Saturn a ring outer radius", () => {
    expect(bodyById("saturn")?.ringOuter).toBeGreaterThan(
      bodyById("saturn")!.displayRadius,
    );
  });

  it("gives every body a non-empty Indonesian signature fact", () => {
    for (const b of BODIES) {
      expect(b.copy.fact.trim().length).toBeGreaterThan(0);
      expect(b.copy.type.trim().length).toBeGreaterThan(0);
    }
  });

  it("uses the exact scene values the spec fixes", () => {
    expect(bodyById("ceres")?.displayRadius).toBeCloseTo(0.12, 6);
    expect(bodyById("ceres")?.orbitRadius).toBeCloseTo(17.0, 6);
    expect(bodyById("ceres")?.orbitPeriod).toBeCloseTo(45, 6);
    expect(bodyById("ceres")?.color).toBe("#8d8a85");
    expect(bodyById("saturn")?.ringInner).toBeCloseTo(1.67, 6);
    expect(bodyById("saturn")?.ringOuter).toBeCloseTo(3.52, 6);
  });

  it("looks bodies up by id and returns undefined otherwise", () => {
    expect(bodyById("earth")?.id).toBe("earth");
    expect(bodyById("nope" as BodyId)).toBeUndefined();
  });
});
