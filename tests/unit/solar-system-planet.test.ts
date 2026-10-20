import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  orbitPosition,
  spinSign,
  spinAngle,
  orbitLinePoints,
  ORBIT_SEGMENTS,
} from "@/features/solar-system-3d/bodies/planet";
import { BODIES, bodyById } from "@/features/solar-system-3d/solar-system.data";

const earth = bodyById("earth")!;
const pluto = bodyById("pluto")!;

describe("orbitPosition", () => {
  it("puts a body at its orbit radius from the origin", () => {
    const out = new THREE.Vector3();
    orbitPosition(earth, 3.7, out);
    expect(Math.hypot(out.x, out.z)).toBeCloseTo(earth.orbitRadius!, 6);
    expect(out.y).toBe(0);
  });

  it("follows theta = startAngle + 2pi * simTime / orbitPeriod", () => {
    const out = new THREE.Vector3();
    const t = 5;
    orbitPosition(earth, t, out);
    const theta =
      (earth.startAngleDeg * Math.PI) / 180 +
      (2 * Math.PI * t) / earth.orbitPeriod!;
    expect(out.x).toBeCloseTo(earth.orbitRadius! * Math.cos(theta), 6);
    expect(out.z).toBeCloseTo(-earth.orbitRadius! * Math.sin(theta), 6);
  });

  it("starts at the start angle when simTime is zero", () => {
    const out = new THREE.Vector3();
    orbitPosition(earth, 0, out);
    const theta = (earth.startAngleDeg * Math.PI) / 180;
    expect(out.x).toBeCloseTo(earth.orbitRadius! * Math.cos(theta), 6);
    expect(out.z).toBeCloseTo(-earth.orbitRadius! * Math.sin(theta), 6);
  });

  it("travels counter-clockwise seen from +Y (theta grows)", () => {
    // At theta = 0 the body sits on +X and moves toward -Z, which is what
    // counter-clockwise looks like from above.
    const atZero = new THREE.Vector3();
    const later = new THREE.Vector3();
    orbitPosition({ ...earth, startAngleDeg: 0 }, 0, atZero);
    orbitPosition({ ...earth, startAngleDeg: 0 }, earth.orbitPeriod! / 8, later);
    expect(atZero.z).toBeCloseTo(0, 6);
    expect(later.z).toBeLessThan(0);
  });

  it("returns the out vector for chaining", () => {
    const out = new THREE.Vector3();
    expect(orbitPosition(earth, 1, out)).toBe(out);
  });
});

describe("spin", () => {
  it("marks retrograde spin sign -1 for Venus, Uranus and Pluto", () => {
    expect(spinSign(bodyById("venus")!)).toBe(-1);
    expect(spinSign(bodyById("uranus")!)).toBe(-1);
    expect(spinSign(pluto)).toBe(-1);
    expect(spinSign(earth)).toBe(1);
  });

  it("advances by sign * 2pi * simTime / spinPeriod", () => {
    expect(spinAngle(earth, earth.spinPeriod)).toBeCloseTo(2 * Math.PI, 6);
    expect(spinAngle(pluto, pluto.spinPeriod)).toBeCloseTo(-2 * Math.PI, 6);
  });
});

describe("orbitLinePoints", () => {
  it("is a closed 256 segment loop on the orbit radius", () => {
    const points = orbitLinePoints(earth);
    expect(ORBIT_SEGMENTS).toBe(256);
    expect(points).toHaveLength(ORBIT_SEGMENTS + 1);
    for (const p of points) {
      expect(Math.hypot(p.x, p.z)).toBeCloseTo(earth.orbitRadius!, 6);
      expect(p.y).toBe(0);
    }
    expect(points[0]!.x).toBeCloseTo(points[points.length - 1]!.x, 6);
  });
});

describe("BODIES wiring", () => {
  it("has exactly one body with a null orbit (the Sun)", () => {
    expect(BODIES.filter((b) => b.orbitRadius === null)).toHaveLength(1);
  });
});
