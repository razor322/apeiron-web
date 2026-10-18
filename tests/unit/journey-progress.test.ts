// @vitest-environment jsdom
import { afterEach, describe, it, expect, beforeEach } from "vitest";
import { readVisited, markVisited, resetJourney, subscribeJourney } from "@/lib/journey-progress";

const KEY = "apeiron:journey";

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => {
  window.localStorage.clear();
});

describe("journey progress store", () => {
  it("starts empty", () => {
    expect(readVisited()).toEqual([]);
  });

  it("marks a stage visited and is idempotent", () => {
    markVisited("earth");
    markVisited("earth");
    expect(readVisited()).toEqual(["earth"]);
  });

  it("keeps first-open order and never removes an id", () => {
    markVisited("earth");
    markVisited("star");
    markVisited("earth");
    expect(readVisited()).toEqual(["earth", "star"]);
  });

  it("resets the list", () => {
    markVisited("earth");
    resetJourney();
    expect(readVisited()).toEqual([]);
  });

  it("notifies subscribers on change, not on a repeat mark", () => {
    let calls = 0;
    const unsubscribe = subscribeJourney(() => {
      calls += 1;
    });
    markVisited("earth");
    markVisited("earth");
    resetJourney();
    unsubscribe();
    expect(calls).toBe(2);
  });

  it("returns empty and does not throw when storage is blocked", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    expect(() => markVisited("earth")).not.toThrow();
    expect(readVisited()).toEqual([]);
    if (original) Object.defineProperty(window, "localStorage", original);
  });

  it("ignores a corrupted stored value", () => {
    window.localStorage.setItem(KEY, "{not json");
    expect(readVisited()).toEqual([]);
  });
});
