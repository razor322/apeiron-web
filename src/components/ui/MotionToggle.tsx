"use client";

import { useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/en";
import { getCalm, getReducedMotion, setCalm, subscribeCalm } from "@/lib/motion-preference";

type MotionToggleProps = {
  dict: Dictionary;
};

// A labelled button that flips between full and calm motion. It honors the OS
// setting first: if the OS forces reduced motion, calm cannot be turned off, so
// no dead control is shown.
export function MotionToggle({ dict }: MotionToggleProps) {
  const wantsCalm = useSyncExternalStore(subscribeCalm, getCalm, () => false);
  const prefersReduced = useSyncExternalStore(subscribeCalm, getReducedMotion, () => true);

  if (prefersReduced) return null;

  return (
    <button
      type="button"
      aria-pressed={wantsCalm}
      onClick={() => setCalm(!wantsCalm)}
      title={dict.motion.hint}
      className="min-h-9 rounded-full border border-[color:var(--line)] px-4 font-sans text-xs text-dust transition-colors hover:border-amber hover:text-amber"
    >
      {dict.motion.toggle}: {wantsCalm ? dict.motion.full : dict.motion.calm}
    </button>
  );
}
