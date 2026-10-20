// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { SolarSystem3D } from "@/features/solar-system-3d/SolarSystem3D";
import { BODIES } from "@/features/solar-system-3d/solar-system.data";
import { id } from "@/i18n/id";

const dispose = vi.fn();
const start = vi.fn();
const pause = vi.fn();
const focus = vi.fn();
const constructorSpy = vi.fn();

// Toggled per test: when true the "WebGL" constructor throws, standing in for a
// device with no context.
const state = { fail: false };

vi.mock("@/features/solar-system-3d/SolarSystem", () => {
  class SolarSystem {
    constructor(...args: unknown[]) {
      if (state.fail) throw new Error("WebGL unavailable");
      constructorSpy(...args);
    }
    start = start;
    pause = pause;
    dispose = dispose;
    focus = focus;
    setTimeScale = vi.fn();
    toggleOrbits = vi.fn();
    toggleMoons = vi.fn();
    toggleLabels = vi.fn();
    resetView = vi.fn();
  }
  return { SolarSystem };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  state.fail = false;
});

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia;
});

describe("SolarSystem3D", () => {
  it("renders a rail button for every body", async () => {
    render(<SolarSystem3D locale="id" dict={id} />);
    const rail = screen.getByRole("navigation", { name: id.solarSystem3d.railLabel });
    expect(rail.querySelectorAll("button")).toHaveLength(BODIES.length);
    expect(screen.getByRole("button", { name: "Matahari" })).toBeInTheDocument();
  });

  it("opens the info card with the Indonesian copy after selecting a body", async () => {
    render(<SolarSystem3D locale="id" dict={id} />);
    await waitFor(() => expect(constructorSpy).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Jupiter" }));
    await waitFor(() => expect(focus).toHaveBeenCalledWith("jupiter"));
    expect(screen.getByText("Raksasa gas")).toBeInTheDocument();
    expect(screen.getByText(id.solarSystem3d.info.type)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: id.solarSystem3d.info.learnMore }),
    ).toHaveAttribute("href", "/id/explore/planet/jupiter");
  });

  it("shows the failure message when WebGL is unavailable", async () => {
    state.fail = true;
    render(<SolarSystem3D locale="id" dict={id} />);
    await waitFor(() =>
      expect(screen.getByText(id.solarSystem3d.fallbackNote)).toBeInTheDocument(),
    );
  });

  it("disposes the scene on unmount", async () => {
    const { unmount } = render(<SolarSystem3D locale="id" dict={id} />);
    await waitFor(() => expect(constructorSpy).toHaveBeenCalled());
    unmount();
    await waitFor(() => expect(dispose).toHaveBeenCalled());
  });
});
