import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { asteroidCounts } from "./asteroid-belt";
import { kuiperCounts } from "./kuiper-belt";

// Post-processing and the per-tier budget in one place. The bloom pass runs on
// the high and medium tiers only: a high luminance threshold keeps the bloom on
// the Sun (the one surface bright enough to cross it) while the planets, orbit
// lines and starfield stay clean. The low tier skips the composer entirely and
// leans on the Sun's additive glow sprite, which is nearly free.

export type Quality = "low" | "medium" | "high";

export type TierRow = {
  belt: number;
  kuiper: number;
  pixelRatioCap: number;
};

// One authoritative table for the whole scene: the belt and Kuiper instance
// counts are read straight from their own tier functions so the numbers can
// never drift apart, and the pixel-ratio cap bounds the fill cost per tier.
export const TIER_TABLE: Record<Quality, TierRow> = {
  low: { belt: asteroidCounts("low"), kuiper: kuiperCounts("low"), pixelRatioCap: 1 },
  medium: { belt: asteroidCounts("medium"), kuiper: kuiperCounts("medium"), pixelRatioCap: 1.5 },
  high: { belt: asteroidCounts("high"), kuiper: kuiperCounts("high"), pixelRatioCap: 2 },
};

// The low tier renders straight to the canvas; the two stronger tiers pay for
// the composer because the bloom is what sells the Sun at this scale.
export function shouldUseBloom(tier: Quality): boolean {
  return tier !== "low";
}

export function tierCounts(tier: Quality): { belt: number; kuiper: number } {
  const row = TIER_TABLE[tier];
  return { belt: row.belt, kuiper: row.kuiper };
}

// Bloom parameters. The threshold sits high on the tone-mapped luminance scale
// so only the Sun's near-white core crosses it; the planets sit well below and
// never halo.
const BLOOM_THRESHOLD = 0.9;
const BLOOM_STRENGTH = 0.7;
const BLOOM_RADIUS = 0.4;

// Builds an EffectComposer for the high and medium tiers: a scene render, the
// bloom, then an output pass that applies tone mapping and the output color
// space (the renderer no longer does that once a composer owns the final draw).
// Returns null on the low tier, where the caller renders directly.
export function createComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  tier: Quality,
  size: { width: number; height: number },
): EffectComposer | null {
  if (!shouldUseBloom(tier)) return null;

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(size.width, size.height);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(
    new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      BLOOM_STRENGTH,
      BLOOM_RADIUS,
      BLOOM_THRESHOLD,
    ),
  );
  composer.addPass(new OutputPass());
  return composer;
}
