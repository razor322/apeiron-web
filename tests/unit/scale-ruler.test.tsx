// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ScaleRuler } from "@/features/cosmic-journey/ScaleRuler";
import { en } from "@/i18n/en";
import { NAMED_STAGES } from "@/features/cosmic-journey/stages";

afterEach(cleanup);

describe("scale ruler", () => {
  it("labels every named stage", () => {
    render(<ScaleRuler exponent={7} activeStageId="earth" dict={en} />);
    expect(screen.getByText(en.journey.stages.earth.label)).toBeInTheDocument();
  });

  it("renders five named-stage labels", () => {
    render(<ScaleRuler exponent={7} activeStageId="earth" dict={en} />);
    const shown = NAMED_STAGES.filter((s) => {
      let node: unknown = en;
      for (const key of s.label.split(".")) node = (node as Record<string, unknown>)[key];
      return typeof node === "string" && screen.queryByText(node) !== null;
    });
    expect(shown.length).toBe(NAMED_STAGES.length);
  });

  it("marks the active stage", () => {
    render(<ScaleRuler exponent={7} activeStageId="earth" dict={en} />);
    expect(screen.getByText(en.journey.stages.earth.label)).toHaveAttribute("data-active", "true");
  });
});
