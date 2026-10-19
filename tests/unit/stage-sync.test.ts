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
      expect(Math.abs(e - stage.exponent), `${stage.id} mid e=${e.toFixed(2)} exp=${stage.exponent}`).toBeLessThanOrEqual(1.2);
    }
  });

  it("gives the content stages non-overlapping, ordered windows on the curve", () => {
    const content = STAGES.filter((s) => s.kind === "content");
    for (let i = 1; i < content.length; i++) {
      const prev = content[i - 1]!.range;
      const cur = content[i]!.range;
      expect(cur[0], `${content[i]!.id} must start after ${content[i - 1]!.id} ends`).toBeGreaterThanOrEqual(prev[1] - 0.001);
      expect(exponentAtProgress((cur[0] + cur[1]) / 2)).toBeGreaterThan(exponentAtProgress((prev[0] + prev[1]) / 2));
    }
  });

  it("makes the active stage match the band the scene draws in", () => {
    const star = STAGES.find((s) => s.id === "star")!;
    const mid = (star.range[0] + star.range[1]) / 2;
    expect(activeStageIndex(mid)).toBe(STAGES.indexOf(star));
    expect(exponentAtProgress(mid)).toBeGreaterThan(14);
  });
});
