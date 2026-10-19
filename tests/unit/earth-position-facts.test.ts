import { describe, it, expect } from "vitest";
import { getFact } from "@/features/cosmic-facts/facts";

describe("earth position facts", () => {
  it("carries provenance for the Milky Way position", () => {
    const f = getFact("milky-way-position");
    expect(f).toBeDefined();
    expect(f!.sourceName).toBeTruthy();
    expect(f!.sourceUrl).toBe("https://science.nasa.gov/universe/galaxies/");
    expect(f!.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("states the Milky Way orbit time with a unit", () => {
    const f = getFact("milky-way-orbit-time");
    expect(f).toBeDefined();
    expect(f!.unit).toBe("years");
    expect(f!.displayValue).toMatch(/240 million/);
  });
});
