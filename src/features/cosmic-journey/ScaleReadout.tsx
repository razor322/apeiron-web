"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { readCopy } from "./stages";
import { exponentAtProgress } from "./exponent";
import { formatDuration, formatLength } from "@/lib/astronomy/units/format";

type ScaleReadoutProps = {
  progressRef: MutableRefObject<number>;
  locale: Locale;
  dict: Dictionary;
  className?: string;
};

const C = 299792458;

// The live scale readout: how wide the frame is in real metres, and how long
// light takes to cross it. Decorative (aria-hidden); the meaning is carried by
// the ruler and the stage copy. Numbers are locale-formatted. Written to the DOM
// from a ref-driven loop so scrubbing never re-renders React.
export function ScaleReadout({ progressRef, locale, dict, className = "" }: ScaleReadoutProps) {
  const widthRef = useRef<HTMLParagraphElement | null>(null);
  const crossingRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    let raf = 0;
    let lastWidth = "";
    let lastCrossing = "";
    const tick = () => {
      const widthMeters = 10 ** exponentAtProgress(progressRef.current);
      const width = formatLength(widthMeters, locale);
      const crossing = formatDuration(widthMeters / C, locale);
      if (width !== lastWidth && widthRef.current) {
        widthRef.current.textContent = `≈ ${width}`;
        lastWidth = width;
      }
      if (crossing !== lastCrossing && crossingRef.current) {
        crossingRef.current.textContent = `${readCopy(dict, "journey.lightCrossing")} ${crossing}`;
        lastCrossing = crossing;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef, locale, dict]);

  return (
    <div aria-hidden="true" className={className}>
      <p className="font-sans text-xs text-dust">{readCopy(dict, "journey.widthLabel")}</p>
      <p ref={widthRef} className="font-serif text-2xl leading-tight text-starlight" />
      <p ref={crossingRef} className="mt-1 font-sans text-xs text-dust" />
    </div>
  );
}
