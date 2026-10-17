import { describe, it, expect } from "vitest";
import { CATEGORIES } from "@/features/explorer/categories";
import { getCategoryImage, CATEGORY_IMAGES } from "@/features/explorer/category-images";

describe("category images", () => {
  it("has a credited, described https image for every category", () => {
    for (const category of CATEGORIES) {
      const image = getCategoryImage(category.slug);
      expect(image, `missing image for ${category.slug}`).toBeDefined();
      expect(image!.previewUrl).toMatch(/^https:\/\//);
      expect(image!.credit).toBeTruthy();
      expect(image!.altText.length).toBeGreaterThan(10);
    }
  });
  it("carries provenance fields on each entry", () => {
    for (const image of Object.values(CATEGORY_IMAGES)) {
      expect(image.sourceName).toBe("NASA Image and Video Library");
      expect(image.sourceUrl).toMatch(/^https:\/\/images\.nasa\.gov\//);
      expect(image.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it("returns undefined for an unknown slug", () => {
    expect(getCategoryImage("nope")).toBeUndefined();
  });
});
