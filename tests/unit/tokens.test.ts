import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

describe("design tokens", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  it("defines the four mandated colors exactly", () => {
    expect(css).toMatch(/--color-void:\s*#05060A/i);
    expect(css).toMatch(/--color-starlight:\s*#E8E4DC/i);
    expect(css).toMatch(/--color-dust:\s*#8A8D98/i);
    expect(css).toMatch(/--color-amber:\s*#E8A15B/i);
  });
});
