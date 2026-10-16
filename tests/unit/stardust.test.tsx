// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StardustBody } from "@/features/content/StardustBody";
import { en } from "@/i18n/en";

afterEach(cleanup);

describe("StardustBody", () => {
  it("renders the heading and narrative", () => {
    render(<StardustBody dict={en} />);
    expect(screen.getByRole("heading", { level: 1, name: en.stardust.heading })).toBeInTheDocument();
    expect(screen.getByText(en.stardust.body)).toBeInTheDocument();
  });

  it("shows at least one sourced claim with a source link", () => {
    render(<StardustBody dict={en} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(1);
    const hrefs = links.map((l) => l.getAttribute("href") ?? "");
    expect(hrefs.some((h) => h.startsWith("https://"))).toBe(true);
  });
});
