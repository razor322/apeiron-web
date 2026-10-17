// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MotionToggle } from "@/components/ui/MotionToggle";
import { en } from "@/i18n/en";

afterEach(cleanup);

beforeEach(() => {
  window.localStorage.clear();
  // No OS reduced-motion in this environment.
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia;
});

describe("MotionToggle", () => {
  it("shows the active mode (full by default) and toggles to calm", () => {
    render(<MotionToggle dict={en} />);
    const button = screen.getByRole("button", { name: /Motion: Full motion/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    const after = screen.getByRole("button", { name: /Motion: Calm motion/i });
    expect(after).toHaveAttribute("aria-pressed", "true");
  });

  it("renders nothing when the OS forces reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
    render(<MotionToggle dict={en} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
