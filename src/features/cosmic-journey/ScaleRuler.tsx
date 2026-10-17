"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import type { Dictionary } from "@/i18n/en";
import { MAX_EXPONENT, readCopy } from "./stages";
import { exponentAtProgress } from "./exponent";

type ScaleRulerProps = {
  progressRef?: MutableRefObject<number>;
  exponent: number;
  dict: Dictionary;
  className?: string;
};

const SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function superscript(n: number): string {
  const whole = Math.floor(n);
  return String(whole)
    .split("")
    .map((d) => SUPERSCRIPTS[Number(d)])
    .join("");
}

// Named landmarks on the ruler, at the order of magnitude they sit at, so the
// abstract exponents gain meaning: the Moon's orbit, Earth's orbit, Neptune's
// orbit. Keys resolve to dict copy.
const LANDMARKS: { key: string; exponent: number }[] = [
  { key: "journey.landmarks.moonOrbit", exponent: 8.89 },
  { key: "journey.landmarks.earthOrbit", exponent: 11.48 },
  { key: "journey.landmarks.neptuneOrbit", exponent: 12.95 },
];

// The signature element: one vertical logarithmic ruler, present through every
// stage, with a single glowing amber marker that travels outward. Logarithmic
// because the journey spans many orders of magnitude, and only a log scale holds
// that range on one axis. Amber appears here on the marker alone.
//
// The marker and the 10^x readout are driven from the progress ref in a rAF loop
// (writing style/textContent directly), so they glide with the scroll instead of
// stepping once per stage.
export function ScaleRuler({ progressRef, exponent, dict, className = "" }: ScaleRulerProps) {
  const ticks = Array.from({ length: MAX_EXPONENT + 1 }, (_, i) => i);
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const expRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    // No ref (reduced motion): the marker sits at the active stage's exponent.
    if (!progressRef) {
      if (markerRef.current) {
        markerRef.current.style.bottom = `${Math.min(100, (exponent / MAX_EXPONENT) * 100)}%`;
      }
      if (expRef.current) expRef.current.textContent = `10${superscript(exponent)} m`;
      return;
    }
    let raf = 0;
    let lastExp = -1;
    const tick = () => {
      const e = exponentAtProgress(progressRef.current);
      if (markerRef.current) {
        markerRef.current.style.bottom = `${Math.min(100, (e / MAX_EXPONENT) * 100)}%`;
      }
      const whole = Math.floor(e);
      if (whole !== lastExp && expRef.current) {
        expRef.current.textContent = `10${superscript(e)} m`;
        lastExp = whole;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef, exponent]);

  return (
    <div className={className}>
      <div
        className="relative ml-auto h-[54vh] w-44"
        role="img"
        aria-label={`${readCopy(dict, "journey.rulerTitle")}: 10${superscript(exponent)} m`}
      >
        {ticks.map((i) => {
          const major = i % 3 === 0;
          return (
            <span
              key={i}
              aria-hidden="true"
              className={`absolute right-0 h-px ${major ? "w-3 bg-dust" : "w-1.5 bg-[color:var(--line)]"}`}
              style={{ bottom: `${(i / MAX_EXPONENT) * 100}%` }}
            />
          );
        })}
        <span className="absolute inset-y-0 right-0 w-px bg-[color:var(--line)]" />

        {LANDMARKS.map((landmark) => {
          const active = Math.abs(landmark.exponent - exponent) < 0.8;
          return (
            <span
              key={landmark.key}
              aria-hidden="true"
              className={`absolute right-4 -translate-y-1/2 whitespace-nowrap font-sans text-[11px] transition-colors ${
                active ? "text-amber" : "text-dust"
              }`}
              style={{ bottom: `${(landmark.exponent / MAX_EXPONENT) * 100}%` }}
            >
              {readCopy(dict, landmark.key)}
            </span>
          );
        })}

        <span
          ref={markerRef}
          aria-hidden="true"
          className="absolute -right-1 h-0.5 w-6 -translate-y-1/2 bg-amber shadow-[0_0_10px_var(--color-amber)]"
          style={{ bottom: "0%" }}
        />
      </div>
      <p ref={expRef} className="mt-4 font-mono text-sm text-starlight" />
      <p className="mt-1 font-sans text-xs text-dust">
        {readCopy(dict, "journey.rulerTitle")}
      </p>
    </div>
  );
}
