import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createSun } from "@/features/solar-system-3d/sun";
import {
  createStarfield,
  STAR_COUNT,
  STAR_SHELL_INNER,
  STAR_SHELL_OUTER,
} from "@/features/solar-system-3d/starfield";
import { SCALE } from "@/features/solar-system-3d/solar-system.data";

describe("createSun", () => {
  it("puts a PointLight at the origin with no decay", () => {
    const { light } = createSun();
    expect(light).toBeInstanceOf(THREE.PointLight);
    expect(light.decay).toBe(0);
    expect(light.position.x).toBe(0);
    expect(light.position.y).toBe(0);
    expect(light.position.z).toBe(0);
  });

  it("sizes the sun sphere to SCALE.sunRadius", () => {
    const { mesh } = createSun();
    const geometry = mesh.geometry as THREE.SphereGeometry;
    expect(geometry.parameters.radius).toBeCloseTo(SCALE.sunRadius, 6);
  });

  it("keeps the light with the sun group", () => {
    const { group, light, mesh } = createSun();
    expect(group.children).toContain(light);
    expect(group.children).toContain(mesh);
  });
});

describe("createStarfield", () => {
  it("is a Points cloud within the desktop budget", () => {
    const field = createStarfield();
    expect(field).toBeInstanceOf(THREE.Points);
    expect(STAR_COUNT).toBeGreaterThanOrEqual(4000);
    expect(STAR_COUNT).toBeLessThanOrEqual(8000);
    const position = field.geometry.getAttribute("position");
    expect(position.count).toBe(STAR_COUNT);
  });

  it("disables size attenuation so distant stars stay visible", () => {
    const field = createStarfield();
    const material = field.material as THREE.PointsMaterial;
    expect(material.sizeAttenuation).toBe(false);
  });

  it("places every star on the shell between the inner and outer radius", () => {
    const field = createStarfield(1234);
    const position = field.geometry.getAttribute("position");
    for (let i = 0; i < position.count; i += 1) {
      const r = Math.hypot(position.getX(i), position.getY(i), position.getZ(i));
      expect(r).toBeGreaterThanOrEqual(STAR_SHELL_INNER - 1e-6);
      expect(r).toBeLessThanOrEqual(STAR_SHELL_OUTER + 1e-6);
    }
  });
});
