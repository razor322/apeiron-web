"use client";

import { useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/en";
import { getCalm, getReducedMotion, setCalm, subscribeCalm } from "@/lib/motion-preference";

type MotionToggleProps = {
  dict: Dictionary;
};

const noopSubscribe = () => () => {};

// A labelled button that flips between full and calm motion. It honors the OS
// setting first: if the OS forces reduced motion, calm cannot be turned off, so
// no dead control is shown. The stored value lives only in the browser, so the
// control renders only after hydration (useSyncExternalStore, no effect).
//
// The label states the mode that is ACTIVE now (not the action), and aria-pressed
// reflects it, so the control reads the same to sight and to a screen reader.
export function MotionToggle({ dict }: MotionToggleProps) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const calm = useSyncExternalStore(subscribeCalm, getCalm, () => true);
  const prefersReduced = useSyncExternalStore(subscribeCalm, getReducedMotion, () => true);

  if (!hydrated || prefersReduced) return null;

  const mode = calm ? dict.motion.calm : dict.motion.full;

  return (
    <button
      type="button"
      aria-pressed={calm}
      aria-label={`${dict.motion.toggle}: ${mode}`}
      onClick={() => setCalm(!calm)}
      title={dict.motion.hint}
      className="min-h-9 rounded-full border border-[color:var(--line)] px-4 font-sans text-xs text-dust transition-colors hover:border-amber hover:text-amber"
    >
      {dict.motion.toggle}: {mode}
    </button>
  );
}
