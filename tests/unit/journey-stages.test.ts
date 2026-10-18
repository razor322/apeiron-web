import { describe, it, expect } from "vitest";
import { STAGES, activeStageIndex } from "@/features/cosmic-journey/stages";

describe("journey stages", () => {
  it("starts at the hero, passes a mid transition, and ends at the outro", () => {
    expect(STAGES[0]!.id).toBe("hero");
    expect(STAGES[1]!.id).toBe("mid");
    expect(STAGES[STAGES.length - 1]!.id).toBe("outro");
  });

  it("travels the seven named stages in order", () => {
    const content = STAGES.filter((s) => s.kind === "content" || s.kind === "outro");
    expect(content.map((s) => s.id)).toEqual([
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

  it("maps scroll to the active stage by range", () => {
    expect(activeStageIndex(0)).toBe(0);
    expect(activeStageIndex(1)).toBe(STAGES.length - 1);
    let last = -1;
    for (let p = 0; p <= 1; p += 0.02) {
      const i = activeStageIndex(p);
      expect(i).toBeGreaterThanOrEqual(last);
      last = i;
    }
    expect(last).toBe(STAGES.length - 1);
  });
});
