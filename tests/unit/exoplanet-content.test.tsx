// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ExoplanetIntro, ExoplanetRowCard } from "@/features/explorer/ExoplanetContent";
import { en } from "@/i18n/en";
import { id } from "@/i18n/id";

afterEach(cleanup);

const planet = {
  pl_name: "WASP-39 b",
  hostname: "WASP-39",
  disc_year: 2011,
  discoverymethod: "Transit",
  pl_orbper: 4.055259,
  pl_rade: 14.235,
};

describe("ExoplanetIntro", () => {
  it("shows the confirmed count and a source link", () => {
    render(<ExoplanetIntro count={40350} dict={en} locale="en" />);
    expect(screen.getByText("40,350")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Exoplanet Archive/i })).toBeInTheDocument();
  });
  it("groups the count for the Indonesian locale", () => {
    render(<ExoplanetIntro count={40350} dict={id} locale="id" />);
    expect(screen.getByText("40.350")).toBeInTheDocument();
  });
});

describe("ExoplanetRowCard", () => {
  it("renders the name, host star, and numbers", () => {
    render(<ExoplanetRowCard planet={planet} dict={en} />);
    expect(screen.getByText("WASP-39 b")).toBeInTheDocument();
    expect(screen.getByText(/Host star: WASP-39/)).toBeInTheDocument();
    expect(screen.getByText(/2011/)).toBeInTheDocument();
    expect(screen.getByText(/Transit/)).toBeInTheDocument();
  });
});
