import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { MOONS, moonPosition, moonById } from "@/features/solar-system-3d/moons";

describe("MOONS table", () => {
  it("has the spec radii and periods", () => {
    expect(moonById("moon")?.radius).toBeCloseTo(0.14, 6);
    expect(moonById("moon")?.orbitRadius).toBeCloseTo(1.0, 6);
    expect(moonById("moon")?.orbitPeriod).toBeCloseTo(4, 6);

    const jupiter = MOONS.filter((m) => m.parentId === "jupiter");
    expect(jupiter.map((m) => m.id)).toEqual(["io", "europa", "ganymede", "callisto"]);
    const byId = Object.fromEntries(jupiter.map((m) => [m.id, m]));
    expect(byId.io!.radius).toBeCloseTo(0.1, 6);
    expect(byId.io!.orbitRadius).toBeCloseTo(2.3, 6);
    expect(byId.io!.orbitPeriod).toBeCloseTo(5, 6);
    expect(byId.io!.color).toBe("#e6c34a");
    expect(byId.europa!.radius).toBeCloseTo(0.09, 6);
    expect(byId.europa!.orbitRadius).toBeCloseTo(2.8, 6);
    expect(byId.europa!.orbitPeriod).toBeCloseTo(8, 6);
    expect(byId.ganymede!.radius).toBeCloseTo(0.13, 6);
    expect(byId.ganymede!.orbitRadius).toBeCloseTo(3.4, 6);
    expect(byId.ganymede!.orbitPeriod).toBeCloseTo(13, 6);
    expect(byId.callisto!.radius).toBeCloseTo(0.12, 6);
    expect(byId.callisto!.orbitRadius).toBeCloseTo(4.0, 6);
    expect(byId.callisto!.orbitPeriod).toBeCloseTo(24, 6);

    expect(moonById("titan")?.radius).toBeCloseTo(0.13, 6);
    expect(moonById("titan")?.orbitRadius).toBeCloseTo(4.3, 6);
    expect(moonById("titan")?.orbitPeriod).toBeCloseTo(16, 6);

    expect(moonById("triton")?.radius).toBeCloseTo(0.1, 6);
    expect(moonById("triton")?.orbitRadius).toBeCloseTo(1.9, 6);
    expect(moonById("triton")?.orbitPeriod).toBeCloseTo(6, 6);
    expect(moonById("triton")?.retrograde).toBe(true);

    expect(moonById("charon")?.radius).toBeCloseTo(0.11, 6);
    expect(moonById("charon")?.orbitRadius).toBeCloseTo(0.6, 6);
    expect(moonById("charon")?.orbitPeriod).toBeCloseTo(5, 6);

    expect(moonById("phobos")?.parentId).toBe("mars");
    expect(moonById("deimos")?.parentId).toBe("mars");
  });

  it("tags the Earth Moon as tidally locked", () => {
    expect(moonById("moon")?.tidallyLocked).toBe(true);
  });
});

describe("moonPosition", () => {
  it("sits on the moon orbit radius in the local plane", () => {
    const io = moonById("io")!;
    const out = new THREE.Vector3();
    moonPosition(io, 1.3, out);
    expect(Math.hypot(out.x, out.z)).toBeCloseTo(io.orbitRadius, 6);
    expect(out.y).toBe(0);
  });

  it("follows theta = 2pi * simTime / orbitPeriod", () => {
    const io = moonById("io")!;
    const out = new THREE.Vector3();
    const t = 2;
    moonPosition(io, t, out);
    const theta = (2 * Math.PI * t) / io.orbitPeriod;
    expect(out.x).toBeCloseTo(io.orbitRadius * Math.cos(theta), 6);
    expect(out.z).toBeCloseTo(-io.orbitRadius * Math.sin(theta), 6);
  });

  it("reverses direction for retrograde Triton", () => {
    const triton = moonById("triton")!;
    expect(triton.retrograde).toBe(true);
    const out = new THREE.Vector3();
    const t = triton.orbitPeriod / 8;
    moonPosition(triton, t, out);
    // Forward would move toward -Z at theta small and positive; retrograde flips
    // the sign of the angle, so it moves toward +Z.
    expect(out.z).toBeGreaterThan(0);
  });
});
