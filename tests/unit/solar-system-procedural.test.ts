import { describe, it, expect } from "vitest";
import {
  buildProceduralImageData,
  isPowerOfTwo,
  type ProceduralKind,
} from "@/features/solar-system-3d/bodies/procedural";

const JUPITER = ["#d8b48a"];

function rowAverage(
  img: { width: number; data: Uint8ClampedArray },
  y: number,
): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  for (let x = 0; x < img.width; x += 1) {
    const i = (y * img.width + x) * 4;
    r += img.data[i]!;
    g += img.data[i + 1]!;
    b += img.data[i + 2]!;
  }
  return [r / img.width, g / img.width, b / img.width];
}

describe("buildProceduralImageData", () => {
  it("produces power-of-two canvas dimensions", () => {
    for (const kind of ["gas", "rocky", "icy", "pluto"] as ProceduralKind[]) {
      const img = buildProceduralImageData(kind, JUPITER, { seed: 7, size: 128 });
      expect(isPowerOfTwo(img.width)).toBe(true);
      expect(isPowerOfTwo(img.height)).toBe(true);
      expect(img.data.length).toBe(img.width * img.height * 4);
    }
  });

  it("gives gas giants visible latitude banding", () => {
    const img = buildProceduralImageData("gas", JUPITER, { seed: 3, size: 256 });
    const distinct = new Set<string>();
    for (let y = 0; y < img.height; y += 1) {
      const [r, g, b] = rowAverage(img, y);
      distinct.add(`${Math.round(r / 4)}|${Math.round(g / 4)}|${Math.round(b / 4)}`);
    }
    expect(distinct.size).toBeGreaterThan(1);
  });

  it("marks a bright heart region on Pluto", () => {
    const img = buildProceduralImageData("pluto", ["#c9b49a"], { seed: 11, size: 256 });
    let brightest = 0;
    let darkest = 255;
    for (let i = 0; i < img.data.length; i += 4) {
      const luma =
        0.299 * img.data[i]! + 0.587 * img.data[i + 1]! + 0.114 * img.data[i + 2]!;
      if (luma > brightest) brightest = luma;
      if (luma < darkest) darkest = luma;
    }
    expect(brightest - darkest).toBeGreaterThan(30);
  });

  it("is deterministic for a fixed seed", () => {
    const a = buildProceduralImageData("rocky", ["#8c8680"], { seed: 42, size: 128 });
    const b = buildProceduralImageData("rocky", ["#8c8680"], { seed: 42, size: 128 });
    expect(a.data).toEqual(b.data);
  });

  it("fills alpha fully opaque", () => {
    const img = buildProceduralImageData("icy", ["#a8e3e6"], { seed: 1, size: 128 });
    for (let i = 3; i < img.data.length; i += 4) {
      expect(img.data[i]).toBe(255);
    }
  });
});

describe("isPowerOfTwo", () => {
  it("accepts powers of two and rejects the rest", () => {
    expect(isPowerOfTwo(1024)).toBe(true);
    expect(isPowerOfTwo(512)).toBe(true);
    expect(isPowerOfTwo(1000)).toBe(false);
  });
});
