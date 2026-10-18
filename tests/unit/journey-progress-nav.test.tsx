// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { JourneyProgress } from "@/features/cosmic-journey/JourneyProgress";
import { en } from "@/i18n/en";
import { markVisited, readVisited } from "@/lib/journey-progress";

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("journey progress nav", () => {
  it("marks the current stage with aria-current and shows the visited count", () => {
    render(<JourneyProgress activeIndex={2} goTo={() => {}} dict={en} />);
    const current = screen.getAllByRole("button").find((b) => b.getAttribute("aria-current") === "step");
    expect(current).toBeTruthy();
  });

  it("hides the reset control until there is progress", () => {
    render(<JourneyProgress activeIndex={0} goTo={() => {}} dict={en} />);
    expect(screen.queryByRole("button", { name: en.journey.reset.label })).toBeNull();
  });

  it("shows the reset control once a stage is visited and clears on click", () => {
    act(() => markVisited("earth"));
    render(<JourneyProgress activeIndex={1} goTo={() => {}} dict={en} />);
    const reset = screen.getByRole("button", { name: en.journey.reset.label });
    fireEvent.click(reset);
    expect(readVisited()).toEqual([]);
  });
});
