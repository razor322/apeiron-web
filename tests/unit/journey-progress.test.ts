import { describe, it, expect } from "vitest";
import { STAGES, activeStageIndex } from "@/features/cosmic-journey/stages";

describe("journey stages", () => {
  it("has exactly seven stages in the mandated order", () => {
    expect(STAGES.map((s) => s.id)).toEqual([
      "hero",
      "earth",
      "solar-system",
      "star",
      "galaxy",
      "universe",
      "outro",
    ]);
  });
  it("every stage has an accessible label", () => {
    for (const s of STAGES) expect(s.ariaLabel.length).toBeGreaterThan(0);
  });
  it("maps a scroll fraction to the active stage index", () => {
    expect(activeStageIndex(0)).toBe(0);
    expect(activeStageIndex(1)).toBe(6);
    expect(activeStageIndex(0.5)).toBeGreaterThan(0);
  });
});
