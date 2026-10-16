import { describe, it, expect } from "vitest";
import { formatLength, formatDuration, exponentForMeters } from "@/lib/astronomy/units/format";

describe("formatLength", () => {
  it("formats sub-kilometer as meters with 2 sig figs (en)", () => {
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
});

describe("formatDuration", () => {
  it("handles sub-second (en)", () => expect(formatDuration(0.4, "en")).toBe("less than a second"));
  it("handles minutes (en)", () => expect(formatDuration(500, "en")).toBe("8.3 minutes"));
  it("handles hours (en)", () => expect(formatDuration(15120, "en")).toBe("4.2 hours"));
  it("handles minutes (id)", () => expect(formatDuration(500, "id")).toBe("8,3 menit"));
});

describe("exponentForMeters", () => {
  it("returns the decimal order of magnitude", () => {
    expect(exponentForMeters(1.8)).toBe(0);
    expect(exponentForMeters(1.496e11)).toBe(11);
  });
});
