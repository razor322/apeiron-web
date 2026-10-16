"use client";

// One source of truth for the motion preference, shared by the global
// MotionToggle and the CosmicJourney. Two things feed it: the OS setting
// (prefers-reduced-motion) and a stored per-device choice under `apeiron:motion`.
// Only the motion choice is stored: no personal data, no identifier.

const STORAGE_KEY = "apeiron:motion";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeCalm(callback: Listener): () => void {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  const onMedia = () => callback();
  mq.addEventListener("change", onMedia);
  window.addEventListener("storage", callback);
  listeners.add(callback);
  return () => {
    mq.removeEventListener("change", onMedia);
    window.removeEventListener("storage", callback);
    listeners.delete(callback);
  };
}

export function getReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function readStoredCalm(): boolean | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "calm") return true;
    if (value === "full") return false;
  } catch {
    // Storage can be blocked (private mode, policy). Fall through to null.
  }
  return null;
}

export function setCalm(calm: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, calm ? "calm" : "full");
  } catch {
    // Ignore failures: the choice just will not persist.
  }
  emit();
}

// The OS setting always wins when it forces reduced motion.
export function getCalm(): boolean {
  return getReducedMotion() || readStoredCalm() === true;
}
