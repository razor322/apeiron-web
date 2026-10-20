// Generates the planet ring strip PNGs under public/textures. Run once with
// `bun run scripts/generate-ring-strip.ts`; the output is committed. The pixels
// come from the same sampleRingStrip table the mesh samples at runtime, so the
// PNG is only a baked copy for anything that wants a real file (tools, review).
//
// This is a build-time Node script, not app code: it reads no DOM and uses
// sharp (already present in the toolchain) to encode RGBA rows to PNG.

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sampleRingStrip, type RingKind } from "../src/features/solar-system-3d/shaderstrips";

const WIDTH = 2048;
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../public/textures");

const KINDS: RingKind[] = ["saturn", "uranus", "neptune"];

async function writeStrip(kind: RingKind): Promise<void> {
  const raw = Buffer.alloc(WIDTH * 4);
  for (let x = 0; x < WIDTH; x += 1) {
    const { rgb, alpha } = sampleRingStrip(kind, x / (WIDTH - 1));
    const i = x * 4;
    raw[i] = Math.round(rgb[0] * 255);
    raw[i + 1] = Math.round(rgb[1] * 255);
    raw[i + 2] = Math.round(rgb[2] * 255);
    raw[i + 3] = Math.round(alpha * 255);
  }
  const out = resolve(OUT_DIR, `ring-${kind}.png`);
  await sharp(raw, { raw: { width: WIDTH, height: 1, channels: 4 } }).png().toFile(out);
  console.log(`wrote ${out}`);
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  for (const kind of KINDS) {
    await writeStrip(kind);
  }
}

await main();
