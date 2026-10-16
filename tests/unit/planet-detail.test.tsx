// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PlanetDetail } from "@/features/explorer/PlanetDetail";
import { getPlanet } from "@/features/explorer/planets";
import { en } from "@/i18n/en";

afterEach(cleanup);

describe("PlanetDetail", () => {
  it("shows the name, every metric label, a value, a source, and the narrative", () => {
    render(<PlanetDetail planet={getPlanet("jupiter")!} dict={en} locale="en" />);
    expect(screen.getByRole("heading", { level: 1, name: "Jupiter" })).toBeInTheDocument();
    for (const label of [
      "Diameter",
      "Distance from the Sun",
      "Orbital period",
      "Mean temperature",
      "Known moons",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("95")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /NASA Solar System Exploration/ }).length).toBeGreaterThan(0);
    expect(screen.getByText(/ball of hydrogen and helium/)).toBeInTheDocument();
  });
});
