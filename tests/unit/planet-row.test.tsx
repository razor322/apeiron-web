// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PlanetRow } from "@/features/cosmic-journey/PlanetRow";
import { getText } from "@/features/explorer/categories";
import { en } from "@/i18n/en";
import { PLANETS } from "@/features/explorer/planets";

afterEach(cleanup);

describe("planet row", () => {
  it("links every planet to its detail page", () => {
    render(<PlanetRow locale="en" dict={en} />);
    for (const p of PLANETS) {
      const name = String(getText(en, p.nameKey));
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", `/en/explore/planet/${p.slug}`);
    }
  });

  it("shows the heading and intro", () => {
    render(<PlanetRow locale="en" dict={en} />);
    expect(screen.getByText(en.journey.planets.heading)).toBeInTheDocument();
    expect(screen.getByText(en.journey.planets.intro)).toBeInTheDocument();
  });
});
