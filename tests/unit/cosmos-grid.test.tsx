// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CosmosGrid } from "@/features/cosmic-journey/CosmosGrid";
import { en } from "@/i18n/en";
import { CATEGORIES, getText } from "@/features/explorer/categories";

afterEach(cleanup);

describe("cosmos grid", () => {
  it("links every explore category", () => {
    render(<CosmosGrid locale="en" dict={en} />);
    for (const c of CATEGORIES) {
      const href = c.slug === "planet" ? "/en/explore/planet" : `/en/explore/${c.slug}`;
      const name = String(getText(en, c.nameKey) ?? c.slug);
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
    }
  });
});
