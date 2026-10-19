import { describe, it, expect } from "vitest";
import { STAGES, activeStageIndex } from "@/features/cosmic-journey/stages";
import { exponentAtProgress } from "@/features/cosmic-journey/exponent";

describe("stage range versus zoom curve", () => {
  it("lands the camera near each content stage's exponent at the stage midpoint", () => {
    for (const stage of STAGES) {
      if (stage.kind !== "content") continue;
      const [start, end] = stage.range;
      const mid = (start + end) / 2;
      const e = exponentAtProgress(mid);
      // Within 1.5 orders of magnitude of the stage's own scale.
      expect(Math.abs(e - stage.exponent)).toBeLessThanOrEqual(1.5);
    }
  });

  it("makes the active stage match the exponent band the scene draws in", () => {
    // The nearest-star scene draws around e 14 to 16.5. The stage the reader
    // is in at that point must be the star stage, not solar-system or galaxy.
    const star = STAGES.find((s) => s.id === "star")!;
    const mid = (star.range[0] + star.range[1]) / 2;
    expect(activeStageIndex(mid)).toBe(STAGES.indexOf(star));
    expect(exponentAtProgress(mid)).toBeGreaterThan(13.5);
  });
});
