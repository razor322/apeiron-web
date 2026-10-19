import { describe, it, expect } from "vitest";
import { getFact } from "@/features/cosmic-facts/facts";

describe("galaxy facts", () => {
  it("carries full provenance for the galactic centre distance", () => {
    const f = getFact("galactic-centre-distance");
    expect(f).toBeDefined();
    expect(f!.unit).toBe("light-years");
    expect(f!.sourceUrl).toMatch(/^https:\/\//);
    expect(f!.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(f!.confidenceType).toBeTruthy();
  });

  it("states the Milky Way width with a unit", () => {
    const f = getFact("milky-way-diameter");
    expect(f).toBeDefined();
    expect(f!.unit).toBe("light-years");
  });
});
