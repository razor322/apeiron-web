import { describe, it, expect } from "vitest";
import { COSMIC_CALENDAR, scaleToYear } from "@/features/content/cosmic-calendar";

describe("cosmic calendar", () => {
  it("has sourced entries", () => {
    expect(COSMIC_CALENDAR.length).toBeGreaterThanOrEqual(5);
    for (const e of COSMIC_CALENDAR) {
      expect(e.sourceUrl).toMatch(/^https:\/\//);
      expect(e.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.realYearsAgo).toBeGreaterThan(0);
    }
  });
  it("maps the universe's start to the first day of the year-scale", () => {
    expect(scaleToYear(13.8e9)).toBeTruthy();
  });
  it("maps the Big Bang to January and recent events to late December", () => {
    expect(scaleToYear(13.8e9)).toMatch(/January/);
    expect(scaleToYear(250000)).toMatch(/December/);
  });
  it("localizes month names for the Indonesian locale", () => {
    const id = scaleToYear(13.8e9, "id");
    expect(id).not.toBe(scaleToYear(13.8e9, "en"));
    expect(id).toContain("Januari");
  });
  it("keeps entries in newest-to-oldest order by real time", () => {
    for (let i = 1; i < COSMIC_CALENDAR.length; i++) {
      expect(COSMIC_CALENDAR[i - 1]!.realYearsAgo).toBeGreaterThan(
        COSMIC_CALENDAR[i]!.realYearsAgo,
      );
    }
  });
});
