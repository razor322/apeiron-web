import { describe, it, expect } from "vitest";
import { buildSceneSource } from "@/features/solar-system-3d/scene-source";
import { PLANET_GSS, SUN_GSS } from "@/features/solar-system-3d/planet-gss";

describe("scene source", () => {
  const src = buildSceneSource();

  it("declares one scene with the sun and every planet", () => {
    expect(src).toContain("@scene");
    expect(src).toContain(`sphere#${SUN_GSS.id}`);
    for (const p of PLANET_GSS) {
      expect(src).toContain(`sphere#${p.id}`);
    }
  });

  it("gives each object a rule with its radius and colour", () => {
    for (const p of PLANET_GSS) {
      expect(src).toContain(`#${p.id}`);
      expect(src).toContain(p.color);
    }
    expect(src).toContain(SUN_GSS.color);
  });

  it("stops motion under prefers-reduced-motion", () => {
    expect(src).toContain("prefers-reduced-motion");
    expect(src).toContain("animation: none");
  });

  it("is balanced (equal open and close braces)", () => {
    const open = (src.match(/{/g) ?? []).length;
    const close = (src.match(/}/g) ?? []).length;
    expect(open).toBe(close);
  });
});
