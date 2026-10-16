import { describe, it, expect } from "vitest";
import { formatLength, formatDuration, formatPeriod, exponentForMeters } from "@/lib/astronomy/units/format";

describe("formatLength", () => {
  it("formats sub-kilometer as meters with 3 sig figs (en)", () => {
    expect(formatLength(1.8, "en")).toBe("1.8 m");
  });
  it("formats kilometers (en)", () => {
    expect(formatLength(384400000, "en")).toBe("384,000 km");
  });
  it("formats millions of km (en)", () => {
    expect(formatLength(1.496e11, "en")).toBe("150 million km");
  });
  it("formats with Indonesian grouping when locale is id", () => {
    expect(formatLength(384400000, "id")).toBe("384.000 km");
    expect(formatLength(1.496e11, "id")).toBe("150 juta km");
  });
  it("handles zero without producing NaN", () => {
    expect(formatLength(0, "en")).toBe("0 m");
  });
  it("switches unit when the rounded value crosses a boundary", () => {
    expect(formatLength(999_999_999, "en")).toBe("1 million km");
    expect(formatLength(999_999_999_999, "en")).toBe("1 billion km");
  });
});

describe("formatDuration", () => {
  it("handles sub-second (en)", () => expect(formatDuration(0.4, "en")).toBe("less than a second"));
  it("handles minutes (en)", () => expect(formatDuration(500, "en")).toBe("8.3 minutes"));
  it("handles hours (en)", () => expect(formatDuration(15120, "en")).toBe("4.2 hours"));
  it("handles minutes (id)", () => expect(formatDuration(500, "id")).toBe("8,3 menit"));
});

describe("formatPeriod", () => {
  it("formats short periods in days (en)", () => {
    expect(formatPeriod(88 * 86400, "en")).toBe("88 days");
  });
  it("formats long periods in years (en)", () => {
    expect(formatPeriod(164.8 * 31557600, "en")).toBe("165 years");
  });
  it("uses Indonesian words (id)", () => {
    expect(formatPeriod(88 * 86400, "id")).toBe("88 hari");
  });
});

describe("exponentForMeters", () => {
  it("returns the decimal order of magnitude", () => {
    expect(exponentForMeters(1.8)).toBe(0);
    expect(exponentForMeters(1.496e11)).toBe(11);
  });
  it("does not return NaN for zero or negative input", () => {
    expect(exponentForMeters(0)).toBe(0);
    expect(exponentForMeters(-5)).toBe(0);
  });
});
