import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { ringRadialU, ringShadowFactor } from "@/features/solar-system-3d/rings";

// Two pure pieces under test: the radial UV remap, and the analytic planet
// shadow. The Sun is treated as a point at the origin, so a fragment's
// direction to the Sun is the unit vector from the fragment back to origin.

describe("ringRadialU", () => {
  const inner = 1.67;
  const outer = 3.52;

  it("maps a vertex on the inner edge to 0 and the outer edge to 1", () => {
    expect(ringRadialU(inner, inner, outer)).toBeCloseTo(0, 6);
    expect(ringRadialU(outer, inner, outer)).toBeCloseTo(1, 6);
  });

  it("is linear in radius between the edges", () => {
    const mid = (inner + outer) / 2;
    expect(ringRadialU(mid, inner, outer)).toBeCloseTo(0.5, 6);
  });

  it("uses distance from the ring centre, so a vertex carries its radius", () => {
    // distance of point (x, z) from centre is what feeds the remap.
    const d = Math.hypot(2, 2);
    expect(ringRadialU(d, 0, 4)).toBeCloseTo(Math.hypot(2, 2) / 4, 6);
  });
});

describe("ringShadowFactor", () => {
  const sun = new THREE.Vector3(0, 0, 0);
  const planetRadius = 1;

  it("marks a ring point directly behind the planet relative to the Sun as shadowed", () => {
    // Planet between the Sun (origin) and the ring point.
    const planet = new THREE.Vector3(10, 0, 0);
    const behind = new THREE.Vector3(13, 0, 0); // farther from the Sun than the planet
    expect(ringShadowFactor(behind, planet, planetRadius, sun)).toBe(0);
  });

  it("marks a ring point on the Sun side of the planet as lit", () => {
    const planet = new THREE.Vector3(10, 0, 0);
    const sunSide = new THREE.Vector3(7, 0, 0); // between the Sun and the planet
    expect(ringShadowFactor(sunSide, planet, planetRadius, sun)).toBe(1);
  });

  it("marks a point the ray misses (clear of the planet disc) as lit", () => {
    const planet = new THREE.Vector3(10, 0, 0);
    const above = new THREE.Vector3(13, 5, 0); // passes well clear of the planet
    expect(ringShadowFactor(above, planet, planetRadius, sun)).toBe(1);
  });

  it("is 0 or 1, never a partial value", () => {
    const planet = new THREE.Vector3(4, 2, 1);
    const p = new THREE.Vector3(6, 3, 2);
    expect([0, 1]).toContain(ringShadowFactor(p, planet, planetRadius, sun));
  });
});
