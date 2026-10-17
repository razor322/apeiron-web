"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { readCopy } from "./stages";
import { formatDuration, formatLength } from "@/lib/astronomy/units/format";

type ScaleReadoutProps = {
  progressRef: MutableRefObject<number>;
  locale: Locale;
  dict: Dictionary;
  className?: string;
};

const MAX_EXPONENT = 27;
const C = 299792458;

// Screen width, in metres, for a scroll progress value. Mirrors the scene's zoom
// keyframes so the number the reader sees matches the canvas, out to the galaxy
// and the observable universe.
const KEYFRAMES: [number, number][] = [
  [0, 0.3],
  [0.07, 0.3],
  [0.17, 5.2],
  [0.28, 7.2],
  [0.38, 7.2],
  [0.5, 9.2],
  [0.57, 9.2],
  [0.68, 11.3],
  [0.74, 11.3],
  [0.86, 13.05],
  [0.9, 13.05],
  [0.94, 21],
  [0.97, 27],
  [1, 27],
];

function exponentAt(progress: number): number {
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const [p0, e0] = KEYFRAMES[i]!;
    const [p1, e1] = KEYFRAMES[i + 1]!;
    if (progress <= p1) {
      const t = Math.min(1, Math.max(0, (progress - p0) / (p1 - p0)));
      return e0 + (e1 - e0) * (t * 0.35 + t * t * (3 - 2 * t) * 0.65);
    }
  }
  return MAX_EXPONENT;
}

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
      const widthMeters = 10 ** exponentAt(progressRef.current);
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
