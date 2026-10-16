// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NumbersStrip } from "@/features/content/NumbersStrip";
import { COSMIC_FACTS } from "@/features/cosmic-facts/facts";
import { en } from "@/i18n/en";

afterEach(cleanup);

describe("NumbersStrip", () => {
  it("renders a sourced value and a source link for every fact", () => {
    render(<NumbersStrip facts={COSMIC_FACTS} dict={en} />);
    for (const fact of COSMIC_FACTS) {
      expect(screen.getByText(fact.displayValue)).toBeInTheDocument();
    }
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(COSMIC_FACTS.length);
    for (const fact of COSMIC_FACTS) {
      expect(fact.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("shows the confidence type as text, never colour alone", () => {
    render(<NumbersStrip facts={COSMIC_FACTS} dict={en} />);
    expect(screen.getAllByText(/Measured|Calculated/i).length).toBeGreaterThan(0);
  });
});
