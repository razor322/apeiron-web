"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "apeiron:journey";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

let cachedRaw: string | null = null;
let cachedValue: string[] = [];

export function readVisited(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    cachedRaw = null;
    cachedValue = [];
    return cachedValue;
  }
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  if (!raw) {
    cachedValue = [];
    return cachedValue;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    cachedValue = Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    cachedValue = [];
  }
  return cachedValue;
}

function write(ids: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore: the progress just will not persist.
  }
}

export function markVisited(id: string): void {
  const current = readVisited();
  if (current.includes(id)) return;
  write([...current, id]);
  emit();
}

export function resetJourney(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
  emit();
}

export function subscribeJourney(callback: Listener): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  listeners.add(callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    listeners.delete(callback);
  };
}

const EMPTY: string[] = [];

export function useJourneyLog(): { visited: string[]; reset: () => void } {
  const visited = useSyncExternalStore(subscribeJourney, readVisited, () => EMPTY);
  return { visited, reset: resetJourney };
}

export function useTrackStage(id: string): void {
  useEffect(() => {
    markVisited(id);
  }, [id]);
}
