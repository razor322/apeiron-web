// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CATEGORIES, getCategory } from "@/features/explorer/categories";
import { TopicCard } from "@/features/explorer/TopicCard";
import { en } from "@/i18n/en";

afterEach(cleanup);

describe("explorer", () => {
  it("has eight categories with unique slugs", () => {
    expect(CATEGORIES).toHaveLength(8);
    expect(new Set(CATEGORIES.map((c) => c.slug)).size).toBe(8);
  });
  it("looks up by slug", () => {
    expect(getCategory("planet")?.nameKey).toBeTruthy();
    expect(getCategory("nope")).toBeUndefined();
  });
  it("TopicCard links to the detail page", () => {
    render(<TopicCard category={getCategory("planet")!} dict={en} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/en/explore/planet");
  });
  it("keeps the planet category pointing at the planet grid route", () => {
    expect(getCategory("planet")!.slug).toBe("planet");
  });
});
