import { describe, it, expect } from "vitest";
import {
  kuiperCounts,
  sampleKuiper,
} from "@/features/solar-system-3d/kuiper-belt";
import { SCALE } from "@/features/solar-system-3d/solar-system.data";

describe("kuiperCounts", () => {
  it("matches the tier point counts", () => {
    expect(kuiperCounts("high")).toBe(1500);
    expect(kuiperCounts("medium")).toBe(800);
    expect(kuiperCounts("low")).toBe(400);
  });
});

describe("sampleKuiper", () => {
  it("produces points within the Kuiper band", () => {
    const data = sampleKuiper("low");
    expect(data.positions).toHaveLength(400 * 3);
    for (let i = 0; i < data.positions.length; i += 3) {
      const x = data.positions[i]!;
      const y = data.positions[i + 1]!;
      const z = data.positions[i + 2]!;
      const r = Math.hypot(x, y, z);
      expect(r).toBeGreaterThanOrEqual(SCALE.kuiperInner - 1e-6);
      expect(r).toBeLessThanOrEqual(SCALE.kuiperOuter + 1e-6);
    }
  });
});
