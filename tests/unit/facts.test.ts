import { describe, it, expect } from "vitest";
import { COSMIC_FACTS, getFact, factsForStage } from "@/features/cosmic-facts/facts";

describe("COSMIC_FACTS", () => {
  it("every fact has a source name, url, and ISO verification date", () => {
    for (const f of COSMIC_FACTS) {
      expect(f.sourceName, f.id).toBeTruthy();
      expect(f.sourceUrl, f.id).toMatch(/^https?:\/\//);
      expect(f.verifiedAt, f.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(["measured", "estimated", "approximate", "calculated"]).toContain(f.confidenceType);
    }
  });
  it("has unique ids", () => {
    const ids = COSMIC_FACTS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("looks up by id and stage", () => {
    const earth = factsForStage("earth");
    expect(earth.length).toBeGreaterThan(0);
    expect(getFact(earth[0]!.id)?.id).toBe(earth[0]!.id);
  });
});
