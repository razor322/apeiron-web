"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import type { Dictionary } from "@/i18n/en";
import { STAGES, readCopy } from "./stages";
import { useJourneyLog } from "@/lib/journey-progress";

type Props = {
  activeIndex: number;
  dict: Dictionary;
  // Full motion passes the scrubbed progress ref; calm passes nothing and the
  // bar fills by stage index instead.
  progressRef?: MutableRefObject<number>;
  className?: string;
};

// A thin bar showing how far through the journey the reader is, plus a reset
// control that appears only when there is progress. No numbered buttons: the
// stage the reader is in is carried by the ruler, not by a nav.
export function JourneyProgressBar({ activeIndex, dict, progressRef, className = "" }: Props) {
  const { visited, reset } = useJourneyLog();
  const fillRef = useRef<HTMLDivElement | null>(null);
  const lastIndex = Math.max(1, STAGES.length - 1);
  const basePct = (activeIndex / lastIndex) * 100;

  useEffect(() => {
    if (!progressRef) {
      if (fillRef.current) fillRef.current.style.width = `${basePct}%`;
      return;
    }
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, Math.max(0, progressRef.current));
      if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef, basePct]);

  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-label={readCopy(dict, "journey.progressBar.label")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(basePct)}
        className="h-0.5 w-40 overflow-hidden rounded-full bg-[color:var(--line)]"
      >
        <div ref={fillRef} className="h-full w-0 bg-amber" style={{ width: `${basePct}%` }} />
      </div>
      {visited.length > 0 ? (
        <button
          type="button"
          onClick={reset}
          className="mt-2 block font-sans text-xs text-dust underline transition-colors hover:text-amber"
        >
          {readCopy(dict, "journey.progressBar.reset")}
        </button>
      ) : null}
    </div>
  );
}
