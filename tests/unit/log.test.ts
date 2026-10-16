import { describe, it, expect, vi, afterEach } from "vitest";
import { logProvider, timeProvider } from "@/lib/astronomy/log";

afterEach(() => vi.restoreAllMocks());

describe("logProvider", () => {
  it("logs an error event via console.error with the provider and event", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logProvider({ provider: "nasa-apod", event: "error", status: 503, errorClass: "Error" });
    expect(spy).toHaveBeenCalledTimes(1);
    const line = spy.mock.calls[0]![0] as string;
    expect(line).toContain("nasa-apod");
    expect(line).toContain("error");
    expect(line).toContain("503");
  });
  it("logs rate_limited via console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logProvider({ provider: "nasa-apod", event: "rate_limited", status: 429 });
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it("logs success via console.info", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    logProvider({ provider: "nasa-images", event: "ok", ms: 42 });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("timeProvider", () => {
  it("returns a function reporting elapsed milliseconds", () => {
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1042);
    const done = timeProvider();
    expect(done()).toBe(42);
  });
});
