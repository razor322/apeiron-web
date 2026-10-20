// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  shouldUseBloom,
  TIER_TABLE,
  tierCounts,
  type Quality,
} from "@/features/solar-system-3d/post";
import { asteroidCounts } from "@/features/solar-system-3d/asteroid-belt";
import { kuiperCounts } from "@/features/solar-system-3d/kuiper-belt";

describe("shouldUseBloom", () => {
  it("blooms on high and medium", () => {
    expect(shouldUseBloom("high")).toBe(true);
    expect(shouldUseBloom("medium")).toBe(true);
  });
  it("does not bloom on low", () => {
    expect(shouldUseBloom("low")).toBe(false);
  });
});

describe("TIER_TABLE", () => {
  it("maps every tier to the belt / kuiper / pixel-ratio cells", () => {
    const tiers: Quality[] = ["low", "medium", "high"];
    for (const tier of tiers) {
      const row = TIER_TABLE[tier];
      expect(row.belt).toBe(asteroidCounts(tier));
      expect(row.kuiper).toBe(kuiperCounts(tier));
      expect(row.pixelRatioCap).toBeGreaterThan(0);
    }
  });
  it("caps pixel ratio tighter as the tier falls", () => {
    expect(TIER_TABLE.high.pixelRatioCap).toBeGreaterThanOrEqual(
      TIER_TABLE.medium.pixelRatioCap,
    );
    expect(TIER_TABLE.medium.pixelRatioCap).toBeGreaterThanOrEqual(
      TIER_TABLE.low.pixelRatioCap,
    );
  });
});

describe("tierCounts", () => {
  it("returns the belt and kuiper counts for a tier", () => {
    expect(tierCounts("high")).toEqual({
      belt: asteroidCounts("high"),
      kuiper: kuiperCounts("high"),
    });
  });
});
