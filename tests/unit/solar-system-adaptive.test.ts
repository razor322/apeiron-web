import { describe, it, expect } from "vitest";
import {
  stepTier,
  type TierStepState,
} from "@/features/solar-system-3d/adaptive";

const base: TierStepState = {
  tier: "high",
  avgFps: 30,
  lowForSec: 0,
  highForSec: 0,
  sinceStepSec: 100,
};

describe("stepTier", () => {
  it("steps down one tier after 2 s under threshold", () => {
    expect(stepTier({ ...base, lowForSec: 2 }).tier).toBe("medium");
  });
  it("does not step down before 2 s", () => {
    expect(stepTier({ ...base, lowForSec: 1.9 }).tier).toBe("high");
  });
  it("does not step down when fps is fine", () => {
    expect(stepTier({ ...base, avgFps: 60, lowForSec: 5 }).tier).toBe("high");
  });
  it("never steps below low", () => {
    expect(stepTier({ ...base, tier: "low", lowForSec: 5 }).tier).toBe("low");
  });
  it("does not step down twice within the cooldown", () => {
    expect(stepTier({ ...base, lowForSec: 5, sinceStepSec: 3 }).tier).toBe("high");
  });
  it("steps up when fps recovers past the up threshold", () => {
    const state: TierStepState = {
      tier: "low",
      avgFps: 60,
      lowForSec: 0,
      highForSec: 3,
      sinceStepSec: 100,
    };
    expect(stepTier(state).tier).toBe("medium");
  });
  it("does not step up within 10 s of a step", () => {
    const state: TierStepState = {
      tier: "low",
      avgFps: 60,
      lowForSec: 0,
      highForSec: 3,
      sinceStepSec: 9,
    };
    expect(stepTier(state).tier).toBe("low");
  });
  it("never steps above high", () => {
    const state: TierStepState = {
      tier: "high",
      avgFps: 120,
      lowForSec: 0,
      highForSec: 10,
      sinceStepSec: 100,
    };
    expect(stepTier(state).tier).toBe("high");
  });
  it("holds the tier when neither condition is met", () => {
    expect(stepTier(base).tier).toBe("high");
  });
});
