// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { JourneyParallax } from "@/features/cosmic-journey/JourneyParallax";

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia;
});
afterEach(cleanup);

describe("journey parallax", () => {
  it("renders its children", () => {
    render(
      <JourneyParallax>
        <span>the image</span>
      </JourneyParallax>,
    );
    expect(screen.getByText("the image")).toBeInTheDocument();
  });

  it("adds no transform when the OS requests reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
    const { container } = render(
      <JourneyParallax>
        <span>still</span>
      </JourneyParallax>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transform).toBe("");
  });
});
