import { describe, it, expect } from "vitest";
import { PLANETS, getPlanet, formatFact } from "@/features/explorer/planets";

describe("planets registry", () => {
  it("has the eight planets in order from the Sun", () => {
    expect(PLANETS.map((p) => p.slug)).toEqual([
      "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune",
    ]);
  });
  it("gives every fact a source, a metric key, and a confidence type", () => {
    for (const planet of PLANETS) {
      expect(planet.facts.length).toBeGreaterThanOrEqual(5);
      expect(planet.sourceUrl).toMatch(/^https:\/\/science\.nasa\.gov\//);
      expect(planet.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const fact of planet.facts) {
        expect(fact.metricKey).toBeTruthy();
        expect(Number.isFinite(fact.siValue)).toBe(true);
        expect(["measured", "estimated", "approximate", "calculated"]).toContain(
          fact.confidenceType,
        );
      }
    }
  });
  it("points every related slug at a real planet", () => {
    for (const planet of PLANETS) {
      for (const slug of planet.relatedSlugs) {
        expect(getPlanet(slug)).toBeDefined();
      }
    }
  });
  it("looks up by slug", () => {
    expect(getPlanet("mars")?.nameKey).toBe("explore.planets.mars.name");
    expect(getPlanet("nope")).toBeUndefined();
  });
});

describe("formatFact", () => {
  const fact = (metricKey: string) =>
    getPlanet("mars")!.facts.find((f) => f.metricKey === metricKey)!;

  it("formats a length in the locale units", () => {
    expect(formatFact(fact("diameter"), "en")).toBe("6,780 km");
  });
  it("formats a period in days", () => {
    expect(formatFact(fact("orbitalPeriod"), "en")).toBe("687 days");
  });
  it("formats a temperature with the degree unit", () => {
    expect(formatFact(fact("meanTemp"), "en")).toBe("-65\u00B0C");
  });
  it("formats a count as a bare number", () => {
    expect(formatFact(fact("moons"), "en")).toBe("2");
  });
});
