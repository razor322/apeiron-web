// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ObjectHoverCard } from "@/features/cosmic-journey/ObjectHoverCard";
import { getJourneyObject } from "@/features/cosmic-journey/journey-objects";
import { en } from "@/i18n/en";

afterEach(cleanup);

describe("object hover card", () => {
  it("shows the object name and links to it", () => {
    const mars = getJourneyObject("planet-mars")!;
    render(<ObjectHoverCard object={mars} x={100} y={120} locale="en" dict={en} />);
    expect(screen.getByText(en.explore.planets.mars.name)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/en/explore/planet/mars");
  });

  it("renders nothing without an object", () => {
    const { container } = render(<ObjectHoverCard object={undefined} x={0} y={0} locale="en" dict={en} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows an image with alt text", () => {
    const mars = getJourneyObject("planet-mars")!;
    render(<ObjectHoverCard object={mars} x={0} y={0} locale="en" dict={en} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", expect.stringContaining("Mars"));
  });
});
