import { describe, it, expect } from "vitest";
import { BODIES, SCALE, type BodyDef } from "@/features/solar-system-3d/solar-system.data";

// The spec's acceptance criterion 2: no two bodies may overlap (planet spheres,
// rings, and the farthest moon orbit all count). This test guards that the
// scene's orbit spacing stays wider than the sum of adjacent extents.
//
// Moon orbit radii (scene units) mirror src/features/solar-system-3d/moons.ts.
const MOON_ORBIT: Partial<Record<string, number>> = {
  earth: 1.0,
  mars: 1.3,
  jupiter: 4.0,
  saturn: 4.3,
  neptune: 1.9,
  pluto: 0.6,
};

// The full extent of a body: its radius, or its ring outer radius when larger,
// plus the farthest moon orbit when moons are enabled.
function extent(body: BodyDef): number {
  const base = Math.max(body.displayRadius, body.ringOuter ?? 0);
  return base + (MOON_ORBIT[body.id] ?? 0);
}

describe("orbit spacing (no overlap)", () => {
  it("keeps every adjacent pair wider than the sum of their extents", () => {
    const orbiting = BODIES.filter(
      (b): b is BodyDef & { orbitRadius: number } => typeof b.orbitRadius === "number",
    );
    expect(orbiting.length).toBeGreaterThan(1);
    for (let i = 0; i < orbiting.length - 1; i += 1) {
      const a = orbiting[i]!;
      const b = orbiting[i + 1]!;
      const gap = b.orbitRadius - a.orbitRadius;
      const need = extent(a) + extent(b);
      expect(gap, `${a.id} to ${b.id}: gap ${gap} must exceed ${need}`).toBeGreaterThan(need);
    }
  });

  it("places the asteroid belt between Mars and Jupiter", () => {
    const mars = BODIES.find((b) => b.id === "mars")!.orbitRadius!;
    const jupiter = BODIES.find((b) => b.id === "jupiter")!.orbitRadius!;
    expect(SCALE.beltInner).toBeGreaterThan(mars);
    expect(SCALE.beltOuter).toBeLessThan(jupiter);
  });

  it("places the Kuiper belt beyond Pluto", () => {
    const pluto = BODIES.find((b) => b.id === "pluto")!.orbitRadius!;
    expect(SCALE.kuiperInner).toBeGreaterThan(pluto);
  });
});
