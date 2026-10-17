import { describe, it, expect } from "vitest";
import { JOURNEY_IMAGES, getJourneyImage } from "@/features/cosmic-journey/journey-images";
import { STAGES } from "@/features/cosmic-journey/stages";

describe("journey images", () => {
  it("covers the content stages with a credited https image", () => {
    for (const stage of STAGES) {
      if (stage.kind === "hero" || stage.kind === "outro") continue;
      const image = getJourneyImage(stage.id);
      expect(image, `missing image for ${stage.id}`).toBeDefined();
      expect(image!.previewUrl).toMatch(/^https:\/\/images-assets\.nasa\.gov\//);
      expect(image!.credit).toBeTruthy();
      expect(image!.altText.length).toBeGreaterThan(10);
    }
  });
  it("has no image for the hero or outro", () => {
    expect(getJourneyImage("hero")).toBeUndefined();
    expect(getJourneyImage("outro")).toBeUndefined();
  });
  it("carries provenance", () => {
    for (const image of Object.values(JOURNEY_IMAGES)) {
      expect(image.sourceName).toBe("NASA Image and Video Library");
      expect(image.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
