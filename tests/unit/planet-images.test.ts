import { describe, it, expect } from "vitest";
import { PLANETS } from "@/features/explorer/planets";
import { getPlanetImage, PLANET_IMAGES } from "@/features/explorer/planet-images";

describe("planet images", () => {
  it("has a credited, described https image for every planet", () => {
    for (const planet of PLANETS) {
      const image = getPlanetImage(planet.slug);
      expect(image, `missing image for ${planet.slug}`).toBeDefined();
      expect(image!.previewUrl).toMatch(/^https:\/\//);
      expect(image!.credit).toBeTruthy();
      expect(image!.sourceUrl).toMatch(/^https:\/\/science\.nasa\.gov\//);
      expect(image!.altText.length).toBeGreaterThan(10);
    }
  });
  it("carries provenance fields on each entry", () => {
    for (const image of Object.values(PLANET_IMAGES)) {
      expect(image.sourceName).toBe("NASA");
      expect(image.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it("returns undefined for an unknown slug", () => {
    expect(getPlanetImage("pluto")).toBeUndefined();
  });
});
