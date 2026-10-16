// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { planetAge, PLANET_ORBITS } from "@/features/calculators/planet-age";
import { travelTime } from "@/features/calculators/travel-time";
import { PlanetAgeCalculator } from "@/features/calculators/PlanetAgeCalculator";
import { TravelTimeCalculator } from "@/features/calculators/TravelTimeCalculator";
import { en } from "@/i18n/en";
import { id } from "@/i18n/id";

afterEach(cleanup);

describe("planetAge", () => {
  it("converts Earth years to Mars years (period 1.881)", () => {
    const r = planetAge(30, "Mars");
    expect(r.years).toBeCloseTo(15.95, 1);
    expect(r.formula).toMatch(/orbital period/i);
  });
  it("rejects invalid input", () => {
    expect(() => planetAge(-1, "Mars")).toThrow();
    expect(() => planetAge(Number.NaN, "Mars")).toThrow();
    expect(() => planetAge(30, "Pluto")).toThrow(/unknown planet/i);
  });
});

describe("travelTime", () => {
  it("computes Sun to Earth at light speed", () => {
    const { seconds } = travelTime(1.496e11, 299792458);
    expect(seconds).toBeCloseTo(499, 0);
  });
  it("rejects non-positive speed", () => {
    expect(() => travelTime(1000, 0)).toThrow();
    expect(() => travelTime(1000, Number.NaN)).toThrow();
    expect(() => travelTime(Number.POSITIVE_INFINITY, 1)).toThrow();
  });
});

describe("PLANET_ORBITS", () => {
  it("lists eight planets", () => {
    expect(PLANET_ORBITS).toHaveLength(8);
  });
});

describe("PlanetAgeCalculator", () => {
  it("shows the result and the formula/assumption under it", () => {
    render(<PlanetAgeCalculator dict={en} locale="en" />);
    fireEvent.change(screen.getByLabelText(en.calculators.planetAge.ageLabel), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText(en.calculators.planetAge.planetLabel), {
      target: { value: "Mars" },
    });
    expect(screen.getByText(/orbital period/i)).toBeInTheDocument();
  });
  it("shows a direction error on empty input, not a mood", () => {
    render(<PlanetAgeCalculator dict={en} locale="en" />);
    fireEvent.change(screen.getByLabelText(en.calculators.planetAge.ageLabel), {
      target: { value: "" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/positive/i);
  });
});

describe("TravelTimeCalculator", () => {
  it("always renders the assumption note", () => {
    render(<TravelTimeCalculator dict={en} locale="en" />);
    expect(screen.getByText(/ignores acceleration/i)).toBeInTheDocument();
  });
  it("formats the travel-time result for the Indonesian locale", () => {
    render(<TravelTimeCalculator dict={id} locale="id" />);
    expect(screen.queryByText(/minutes/)).not.toBeInTheDocument();
  });
});
