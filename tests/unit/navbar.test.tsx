// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Navbar } from "@/components/ui/Navbar";
import { en } from "@/i18n/en";

afterEach(cleanup);

describe("Navbar", () => {
  it("only links to real routes", () => {
    render(<Navbar locale="en" dict={en} />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    for (const h of hrefs) {
      expect([
        "/en",
        "/en/explore",
        "/en/solar-system-3d",
        "/en/cosmos-today",
        "/en/calculators",
        "/en/about",
      ]).toContain(h);
    }
  });
  it("links to the calculators page", () => {
    render(<Navbar locale="en" dict={en} />);
    const link = screen.getByRole("link", { name: en.nav.calculators });
    expect(link).toHaveAttribute("href", "/en/calculators");
  });
  it("carries the locale prefix for the id locale", () => {
    render(<Navbar locale="id" dict={en} />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/id/explore");
    expect(hrefs.some((h) => h?.startsWith("/en"))).toBe(false);
  });
});
