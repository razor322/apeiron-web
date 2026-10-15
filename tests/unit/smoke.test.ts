import { describe, it, expect } from "vitest";

describe("toolchain", () => {
  it("runs vitest with the @ alias", async () => {
    const mod = await import("@/lib/astronomy/models");
    expect(mod).toBeDefined();
  });
});
