// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { parseAgeQuery, ageQuery } from "@/features/calculators/PlanetAgeCalculator";
import { parseTravelQuery, travelQuery } from "@/features/calculators/TravelTimeCalculator";

describe("calculator url state", () => {
  it("parses a valid age query", () => {
    expect(parseAgeQuery("?age=40&planet=Jupiter")).toEqual({ age: "40", planet: "Jupiter" });
  });

  it("falls back to defaults on missing or invalid age query", () => {
    expect(parseAgeQuery("")).toEqual({ age: "30", planet: "Mars" });
    expect(parseAgeQuery("?age=abc&planet=Nope")).toEqual({ age: "30", planet: "Mars" });
    expect(parseAgeQuery("?age=-5")).toEqual({ age: "30", planet: "Mars" });
  });

  it("round-trips an age query", () => {
    expect(parseAgeQuery(ageQuery("40", "Saturn"))).toEqual({ age: "40", planet: "Saturn" });
  });

  it("parses and defaults a travel query", () => {
    expect(parseTravelQuery("?distance=1000&speed=10")).toEqual({ distance: "1000", speed: "10" });
    expect(parseTravelQuery("?distance=oops")).toEqual({ distance: "149600000", speed: "299792.458" });
  });

  it("round-trips a travel query", () => {
    expect(parseTravelQuery(travelQuery("1000", "10"))).toEqual({ distance: "1000", speed: "10" });
  });
});
