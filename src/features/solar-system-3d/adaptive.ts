import type { Quality } from "./post";

// Adaptive quality: a pure tier-step decision the frame loop drives, plus the
// constants that gate it. The step function is deliberately stateless: the loop
// owns the timers and hands them in, so the decision is a plain function of the
// measured fps and the elapsed times, which makes it testable without a clock.

export type TierStepState = {
  tier: Quality;
  /** Rolling average fps over the probe window. */
  avgFps: number;
  /** Seconds the average has stayed under LOW_FPS. */
  lowForSec: number;
  /** Seconds the average has stayed over HIGH_FPS. */
  highForSec: number;
  /** Seconds since the last tier change. */
  sinceStepSec: number;
};

// Below this the scene is visibly struggling; above the second value there is
// headroom to spend. The gap is hysteresis so a tier does not flap on a wobble.
export const LOW_FPS = 45;
export const HIGH_FPS = 55;

// How long the average must hold before a change, and the cooldown that stops a
// step up chasing a momentary burst. A single step either way each time.
export const LOW_FOR_SEC = 2;
export const HIGH_FOR_SEC = 2;
export const STEP_COOLDOWN_SEC = 10;

const ORDER: Quality[] = ["low", "medium", "high"];

function downOne(tier: Quality): Quality {
  const i = ORDER.indexOf(tier);
  return ORDER[Math.max(0, i - 1)]!;
}

function upOne(tier: Quality): Quality {
  const i = ORDER.indexOf(tier);
  return ORDER[Math.min(ORDER.length - 1, i + 1)]!;
}

// Decides the next tier. A sustained low average steps down one tier; a
// sustained high average steps up, but never more often than the cooldown, and
// never outside [low, high]. Returns the unchanged tier when nothing applies.
export function stepTier(state: TierStepState): { tier: Quality; changed: boolean } {
  const canStep = state.sinceStepSec >= STEP_COOLDOWN_SEC;

  if (state.avgFps < LOW_FPS && state.lowForSec >= LOW_FOR_SEC && canStep) {
    const next = downOne(state.tier);
    return { tier: next, changed: next !== state.tier };
  }

  if (state.avgFps > HIGH_FPS && state.highForSec >= HIGH_FOR_SEC && canStep) {
    const next = upOne(state.tier);
    return { tier: next, changed: next !== state.tier };
  }

  return { tier: state.tier, changed: false };
}
