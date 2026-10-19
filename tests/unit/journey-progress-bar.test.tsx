// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { JourneyProgressBar } from "@/features/cosmic-journey/JourneyProgressBar";
import { en } from "@/i18n/en";
import { markVisited, readVisited } from "@/lib/journey-progress";

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("journey progress bar", () => {
  it("renders a labelled progress bar with no numbered buttons", () => {
    render(<JourneyProgressBar activeIndex={2} dict={en} />);
    expect(screen.getByRole("progressbar", { name: en.journey.progressBar.label })).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("hides the reset control until there is progress", () => {
    render(<JourneyProgressBar activeIndex={0} dict={en} />);
    expect(screen.queryByRole("button", { name: en.journey.progressBar.reset })).toBeNull();
  });

  it("shows the reset control once a stage is visited and clears on click", () => {
    act(() => markVisited("earth"));
    render(<JourneyProgressBar activeIndex={1} dict={en} />);
    fireEvent.click(screen.getByRole("button", { name: en.journey.progressBar.reset }));
    expect(readVisited()).toEqual([]);
  });

  it("fills the bar by active stage when there is no progress ref", () => {
    render(<JourneyProgressBar activeIndex={0} dict={en} />);
    const bar = screen.getByRole("progressbar", { name: en.journey.progressBar.label });
    expect(bar).toHaveAttribute("aria-valuenow", "0");
  });
});
