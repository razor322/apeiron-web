// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PlanetCard } from "@/features/explorer/PlanetCard";
import { getPlanet } from "@/features/explorer/planets";
import { en } from "@/i18n/en";
import { id } from "@/i18n/id";

afterEach(cleanup);

describe("PlanetCard", () => {
  it("links to the planet detail page and shows its diameter", () => {
    render(<PlanetCard planet={getPlanet("mars")!} dict={en} locale="en" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/en/explore/planet/mars");
    expect(screen.getByText("Mars")).toBeInTheDocument();
    expect(screen.getByText(/6,780 km/)).toBeInTheDocument();
  });

  it("formats the diameter for the active locale", () => {
    render(<PlanetCard planet={getPlanet("mars")!} dict={id} locale="id" />);
    expect(screen.getByText(/6\.780 km/)).toBeInTheDocument();
  });
});
