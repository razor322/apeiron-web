import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  nightBlendFactor,
  CLOUD_RADIUS_RATIO,
  ATMOSPHERE_RADIUS_RATIO,
} from "@/features/solar-system-3d/bodies/earth";
import { SCALE } from "@/features/solar-system-3d/solar-system.data";

describe("nightBlendFactor", () => {
  it("is zero on the fully lit side", () => {
    const n = new THREE.Vector3(1, 0, 0);
    const s = new THREE.Vector3(1, 0, 0);
    expect(nightBlendFactor(n, s)).toBe(0);
  });

  it("approaches one on the night side", () => {
    const n = new THREE.Vector3(-1, 0, 0);
    const s = new THREE.Vector3(1, 0, 0);
    expect(nightBlendFactor(n, s)).toBeGreaterThan(0.95);
  });

  it("is 0.5 at the terminator", () => {
    const n = new THREE.Vector3(0, 1, 0);
    const s = new THREE.Vector3(1, 0, 0);
    expect(nightBlendFactor(n, s)).toBeCloseTo(0.5, 6);
  });

  it("clamps between zero and one for any dot product", () => {
    const s = new THREE.Vector3(1, 0, 0);
    for (let i = -10; i <= 10; i += 1) {
      const v = nightBlendFactor(new THREE.Vector3(i, 0, 0), s);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe("Earth shell ratios", () => {
  it("puts the cloud shell just above the surface", () => {
    expect(CLOUD_RADIUS_RATIO).toBeCloseTo(1.01, 6);
    expect(SCALE.earthRadius * CLOUD_RADIUS_RATIO).toBeCloseTo(0.505, 6);
  });

  it("puts the atmosphere shell further out than the clouds", () => {
    expect(ATMOSPHERE_RADIUS_RATIO).toBeCloseTo(1.06, 6);
    expect(ATMOSPHERE_RADIUS_RATIO).toBeGreaterThan(CLOUD_RADIUS_RATIO);
  });
});
