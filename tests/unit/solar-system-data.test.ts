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
      beltInner: 19,
      beltOuter: 25,
      kuiperInner: 74,
      kuiperOuter: 88,
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
    expect(bodyById("ceres")?.orbitRadius).toBeCloseTo(21.0, 6);
    expect(bodyById("ceres")?.orbitPeriod).toBeCloseTo(45, 6);
    expect(bodyById("ceres")?.color).toBe("#8d8a85");
    expect(bodyById("saturn")?.ringInner).toBeCloseTo(1.67, 6);
    expect(bodyById("saturn")?.ringOuter).toBeCloseTo(3.52, 6);
  });

  it("looks bodies up by id and returns undefined otherwise", () => {
    expect(bodyById("earth")?.id).toBe("earth");
    expect(bodyById("nope" as BodyId)).toBeUndefined();
  });

  it("pins the spec table for every body", () => {
    const table: Array<{
      id: BodyId;
      displayRadius: number;
      orbitRadius: number | null;
      orbitPeriod: number | null;
      spinPeriod: number;
      axialTiltDeg: number;
      inclinationDeg: number;
      startAngleDeg: number;
    }> = [
      { id: "sun", displayRadius: 3.5, orbitRadius: null, orbitPeriod: null, spinPeriod: 120, axialTiltDeg: 7.25, inclinationDeg: 0, startAngleDeg: 0 },
      { id: "mercury", displayRadius: 0.31, orbitRadius: 6.0, orbitPeriod: 8, spinPeriod: 60, axialTiltDeg: 0.03, inclinationDeg: 7.0, startAngleDeg: 20 },
      { id: "venus", displayRadius: 0.49, orbitRadius: 9.0, orbitPeriod: 14, spinPeriod: 90, axialTiltDeg: 177.4, inclinationDeg: 3.4, startAngleDeg: 130 },
      { id: "earth", displayRadius: 0.5, orbitRadius: 12.0, orbitPeriod: 20, spinPeriod: 10, axialTiltDeg: 23.4, inclinationDeg: 0, startAngleDeg: 250 },
      { id: "mars", displayRadius: 0.36, orbitRadius: 16.0, orbitPeriod: 30, spinPeriod: 10, axialTiltDeg: 25.2, inclinationDeg: 1.85, startAngleDeg: 60 },
      { id: "ceres", displayRadius: 0.12, orbitRadius: 21.0, orbitPeriod: 45, spinPeriod: 45, axialTiltDeg: 4, inclinationDeg: 10.6, startAngleDeg: 285 },
      { id: "jupiter", displayRadius: 1.66, orbitRadius: 31.0, orbitPeriod: 60, spinPeriod: 6, axialTiltDeg: 3.1, inclinationDeg: 1.3, startAngleDeg: 200 },
      { id: "saturn", displayRadius: 1.51, orbitRadius: 46.0, orbitPeriod: 90, spinPeriod: 7, axialTiltDeg: 26.7, inclinationDeg: 2.5, startAngleDeg: 310 },
      { id: "uranus", displayRadius: 1.0, orbitRadius: 56.0, orbitPeriod: 130, spinPeriod: 9, axialTiltDeg: 97.8, inclinationDeg: 0.77, startAngleDeg: 100 },
      { id: "neptune", displayRadius: 0.98, orbitRadius: 64.0, orbitPeriod: 170, spinPeriod: 8, axialTiltDeg: 28.3, inclinationDeg: 1.77, startAngleDeg: 40 },
      { id: "pluto", displayRadius: 0.22, orbitRadius: 71.0, orbitPeriod: 210, spinPeriod: 45, axialTiltDeg: 122.5, inclinationDeg: 17.2, startAngleDeg: 160 },
    ];
    for (const row of table) {
      const b = bodyById(row.id);
      expect(b, `missing ${row.id}`).toBeDefined();
      expect(b!.displayRadius).toBeCloseTo(row.displayRadius, 6);
      expect(b!.orbitRadius).toBe(row.orbitRadius);
      expect(b!.orbitPeriod).toBe(row.orbitPeriod);
      expect(b!.spinPeriod).toBe(row.spinPeriod);
      expect(b!.axialTiltDeg).toBeCloseTo(row.axialTiltDeg, 6);
      expect(b!.inclinationDeg).toBeCloseTo(row.inclinationDeg, 6);
      expect(b!.startAngleDeg).toBe(row.startAngleDeg);
    }
  });

  it("gives every body a distinct start angle", () => {
    const angles = BODIES.map((b) => b.startAngleDeg);
    expect(new Set(angles).size).toBe(angles.length);
  });
});
