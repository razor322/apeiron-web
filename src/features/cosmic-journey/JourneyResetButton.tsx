"use client";

import type { Dictionary } from "@/i18n/en";
import { useJourneyLog } from "@/lib/journey-progress";
import { readCopy } from "./stages";

// Renders only when there is progress to clear, so the nav stays quiet for a
// first-time reader. One click clears the device-local list.
export function JourneyResetButton({ dict }: { dict: Dictionary }) {
  const { visited, reset } = useJourneyLog();
  if (visited.length === 0) return null;
  return (
    <button
      type="button"
      onClick={reset}
      className="ml-2 font-sans text-xs text-dust underline transition-colors hover:text-amber"
    >
      {readCopy(dict, "journey.reset.label")}
    </button>
  );
}
