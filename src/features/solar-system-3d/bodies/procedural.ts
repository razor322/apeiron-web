import * as THREE from "three";
import { seededRandom } from "../sun";

// Procedural surface textures for every body without a verified photographic
// texture. The pixel work is a pure function (buildProceduralImageData) so it
// is unit testable without a canvas; proceduralTexture wraps the same pixels in
// a CanvasTexture for the renderer.

export type ProceduralKind = "gas" | "rocky" | "icy" | "pluto";

export type ProceduralOpts = {
  seed?: number;
  size?: number;
  // A single bright oval, used for the Great Red Spot and the Great Dark Spot.
  spot?: { color: string; u: number; v: number; radius: number };
  // Frosted caps at the top and bottom of a rocky body (Mars).
  polarCaps?: boolean;
  // Soft horizontal cloud swirls (Venus).
  clouds?: boolean;
};

export type ProceduralImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

const DEFAULT_SIZE = 512;

export function isPowerOfTwo(n: number): boolean {
  return Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0;
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

// A small value-noise grid with bilinear interpolation, seeded so a texture is
// identical on every build. Ample for surface mottling; not a gradient-noise
// implementation because nothing here needs the extra octaves to look smooth.
function makeNoise(seed: number, gridSize = 32): (x: number, y: number) => number {
  const rng = seededRandom(seed);
  const grid = new Float32Array(gridSize * gridSize);
  for (let i = 0; i < grid.length; i += 1) grid[i] = rng();

  const at = (ix: number, iy: number): number => {
    const x = ((ix % gridSize) + gridSize) % gridSize;
    const y = ((iy % gridSize) + gridSize) % gridSize;
    return grid[y * gridSize + x] ?? 0;
  };

  const smooth = (t: number): number => t * t * (3 - 2 * t);

  return (x: number, y: number): number => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = smooth(x - x0);
    const fy = smooth(y - y0);
    const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx;
    const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
    return top * (1 - fy) + bottom * fy;
  };
}

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function lighten(c: [number, number, number], amount: number): [number, number, number] {
  return [c[0] + (255 - c[0]) * amount, c[1] + (255 - c[1]) * amount, c[2] + (255 - c[2]) * amount];
}

function darken(c: [number, number, number], amount: number): [number, number, number] {
  return [c[0] * (1 - amount), c[1] * (1 - amount), c[2] * (1 - amount)];
}

export function buildProceduralImageData(
  kind: ProceduralKind,
  colors: string[],
  opts: ProceduralOpts = {},
): ProceduralImage {
  const size = opts.size ?? DEFAULT_SIZE;
  const seed = opts.seed ?? 1;
  const base = parseHex(colors[0] ?? "#888888");
  const alt = parseHex(colors[1] ?? colors[0] ?? "#888888");
  const noise = makeNoise(seed, 64);
  const fine = makeNoise(seed + 1, 128);
  const data = new Uint8ClampedArray(size * size * 4);

  const spot = opts.spot
    ? { ...parseHex(opts.spot.color), u: opts.spot.u, v: opts.spot.v, r: opts.spot.radius }
    : null;

  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      let col: [number, number, number];

      if (kind === "gas") {
        // Latitude bands: a sine of latitude plus a slower noise warp gives the
        // zone and belt stripes; the fine noise roughens the edges.
        const band = 0.5 + 0.5 * Math.sin(v * Math.PI * 14 + noise(u * 3, v * 3) * 1.5);
        col = mix(darken(base, 0.28), lighten(base, 0.12), band);
        const streak = fine(u * 8, v * 40);
        col = mix(col, alt, streak * 0.22);
      } else if (kind === "rocky") {
        const craters = fine(u * 20, v * 20);
        col = mix(darken(base, 0.3), lighten(base, 0.18), craters);
        if (opts.clouds) {
          const swirl = noise(u * 4, v * 10);
          col = mix(col, lighten(alt, 0.1), swirl * 0.5);
        }
        if (opts.polarCaps) {
          const cap = Math.max(0, (Math.abs(v - 0.5) - 0.4) / 0.1);
          if (cap > 0) col = mix(col, [240, 244, 250], Math.min(1, cap));
        }
      } else if (kind === "icy") {
        const haze = noise(u * 6, v * 6);
        col = mix(base, lighten(base, 0.2), haze * 0.5);
        const polar = Math.max(0, (Math.abs(v - 0.5) - 0.35) / 0.15);
        col = mix(col, lighten(base, 0.35), Math.min(1, polar) * 0.6);
      } else {
        // Pluto: a mottled tan dwarf with the bright heart shaped Tombaugh
        // Regio sitting slightly below the equator.
        const mottle = fine(u * 16, v * 16);
        col = mix(darken(base, 0.35), lighten(base, 0.15), mottle);
        const dx = (u - 0.5) / 0.28;
        const dy = (v - 0.58) / 0.34;
        const heart =
          Math.max(0, 1 - (dx * dx + dy * dy) * 3.2) *
          (1 - Math.abs(u - 0.5) * 0.4);
        col = mix(col, [244, 240, 232], Math.min(1, heart));
      }

      if (spot) {
        const radius = Math.hypot(u - spot.u, (v - spot.v) * 0.55);
        const falloff = 1 - Math.min(1, radius / spot.r);
        if (falloff > 0) col = mix(col, [spot[0], spot[1], spot[2]], falloff * 0.85);
      }

      const i = (y * size + x) * 4;
      data[i] = col[0];
      data[i + 1] = col[1];
      data[i + 2] = col[2];
      data[i + 3] = 255;
    }
  }

  return { width: size, height: size, data };
}

export function proceduralTexture(
  kind: ProceduralKind,
  colors: string[],
  opts: ProceduralOpts = {},
): THREE.CanvasTexture | THREE.DataTexture {
  const size = opts.size ?? DEFAULT_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  // No 2D context (headless test environments): fall back to a flat DataTexture
  // of the base color so the material still constructs. Browsers always take
  // the canvas path and get the full procedural surface.
  if (!ctx) {
    const [r, g, b] = parseHex(colors[0] ?? "#888888");
    const texture = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }
  const image = buildProceduralImageData(kind, colors, opts);
  const imageData = ctx.createImageData(image.width, image.height);
  imageData.data.set(image.data);
  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
