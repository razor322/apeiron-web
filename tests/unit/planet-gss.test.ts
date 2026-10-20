import { describe, it, expect } from "vitest";
import { PLANET_GSS, SUN_GSS, planetGssFor } from "@/features/solar-system-3d/planet-gss";
import { PLANETS } from "@/features/explorer/planets";

describe("planet gss values", () => {
  it("covers all eight planets", () => {
    expect(PLANET_GSS.map((p) => p.slug).sort()).toEqual(
      PLANETS.map((p) => p.slug).sort(),
    );
  });

  it("gives every planet a positive radius and a colour", () => {
    for (const p of PLANET_GSS) {
      expect(p.radius).toBeGreaterThan(0);
      expect(p.color).toMatch(/^#|^oklch|^rgb/);
    }
  });

  it("keeps the compressed radius ordering by real diameter", () => {
    const jupiter = planetGssFor("jupiter")!;
    const mercury = planetGssFor("mercury")!;
    expect(jupiter.radius).toBeGreaterThan(mercury.radius);
  });

  it("lays the planets out left to right in order", () => {
    for (let i = 1; i < PLANET_GSS.length; i++) {
      expect(PLANET_GSS[i]!.x).toBeGreaterThan(PLANET_GSS[i - 1]!.x);
    }
  });

  it("has a sun", () => {
    expect(SUN_GSS.radius).toBeGreaterThan(0);
    expect(SUN_GSS.color).toMatch(/^#|^oklch|^rgb/);
  });
});
