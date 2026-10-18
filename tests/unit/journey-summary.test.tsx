// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { JourneySummary } from "@/features/cosmic-journey/JourneySummary";
import { STAGES, MAX_EXPONENT } from "@/features/cosmic-journey/stages";
import { en } from "@/i18n/en";
import { markVisited } from "@/lib/journey-progress";

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("journey summary", () => {
  it("names the full order span", () => {
    render(<JourneySummary dict={en} />);
    expect(screen.getByText(new RegExp(String(MAX_EXPONENT)))).toBeInTheDocument();
  });

  it("counts opened stages out of the whole set", () => {
    act(() => markVisited("earth"));
    render(<JourneySummary dict={en} />);
    expect(
      screen.getByText(new RegExp(`1 of ${STAGES.length}`)),
    ).toBeInTheDocument();
  });

  it("shows a sourced fact for an opened stage", () => {
    act(() => markVisited("earth"));
    render(<JourneySummary dict={en} />);
    // earth-diameter is in the registry and attached to the earth stage.
    expect(screen.getByText(/Diameter of Earth/)).toBeInTheDocument();
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
  });

  it("reports completion when every stage is opened", () => {
    act(() => {
      for (const stage of STAGES) markVisited(stage.id);
    });
    render(<JourneySummary dict={en} />);
    expect(screen.getByText(en.journey.summary.complete)).toBeInTheDocument();
  });
});
