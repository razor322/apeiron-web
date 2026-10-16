// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";

vi.mock("web-vitals", () => ({
  onCLS: (cb: (m: { name: string; value: number }) => void) => cb({ name: "CLS", value: 0.01 }),
  onLCP: (cb: (m: { name: string; value: number }) => void) => cb({ name: "LCP", value: 1200 }),
  onINP: (cb: (m: { name: string; value: number }) => void) => cb({ name: "INP", value: 80 }),
}));

import { WebVitalsReporter } from "@/components/perf/WebVitalsReporter";

afterEach(cleanup);

describe("WebVitalsReporter", () => {
  it("registers the three metrics without rendering anything", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const { container } = render(<WebVitalsReporter />);
    expect(container).toBeEmptyDOMElement();
    expect(info).toHaveBeenCalled();
    info.mockRestore();
  });
});
