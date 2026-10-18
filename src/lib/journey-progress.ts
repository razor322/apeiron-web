"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "apeiron:journey";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function readVisited(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
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
  window.addEventListener("storage", callback);
  listeners.add(callback);
  return () => {
    window.removeEventListener("storage", callback);
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
