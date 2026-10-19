import { describe, it, expect } from "vitest";
import { JOURNEY_OBJECTS, getJourneyObject, slugForId } from "@/features/cosmic-journey/journey-objects";

describe("journey objects", () => {
  it("covers the Sun, the Moon, and all eight planets", () => {
    const ids = JOURNEY_OBJECTS.map((o) => o.id);
    for (const id of ["sun", "moon", "planet-mercury", "planet-venus", "planet-earth", "planet-mars", "planet-jupiter", "planet-saturn", "planet-uranus", "planet-neptune"]) {
      expect(ids).toContain(id);
    }
  });

  it("gives every object a real image", () => {
    for (const o of JOURNEY_OBJECTS) {
      expect(o.image, `no image for ${o.id}`).toBeDefined();
      expect(o.image!.previewUrl ?? o.image!.originalUrl).toMatch(/^https:\/\//);
    }
  });

  it("maps planet ids to their planet route", () => {
    expect(slugForId("planet-mars")).toBe("planet/mars");
    expect(slugForId("galaxy")).toBe("galaxy");
  });

  it("resolves by id", () => {
    expect(getJourneyObject("sun")).toBeDefined();
    expect(getJourneyObject("nope")).toBeUndefined();
  });
});
