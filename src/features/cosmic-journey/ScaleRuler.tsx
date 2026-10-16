import type { Dictionary } from "@/i18n/en";
import { MAX_EXPONENT, readCopy } from "./stages";

type ScaleRulerProps = {
  exponent: number;
  dict: Dictionary;
  className?: string;
};

const SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function superscript(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUPERSCRIPTS[Number(d)])
    .join("");
}

// The signature element: one vertical logarithmic ruler, present through every
// stage, with a single glowing amber marker that travels outward. Logarithmic
// because the journey spans 27 orders of magnitude, and only a log scale holds
// that range on one axis. Amber appears here on the marker alone.
export function ScaleRuler({ exponent, dict, className = "" }: ScaleRulerProps) {
  const ticks = Array.from({ length: MAX_EXPONENT + 1 }, (_, i) => i);
  const marker = Math.min(100, (exponent / MAX_EXPONENT) * 100);

  return (
    <div className={className}>
      <div
        className="relative h-[54vh] w-10"
        role="img"
        aria-label={`${readCopy(dict, "journey.rulerTitle")}: 10${superscript(exponent)} m`}
      >
        <span className="absolute inset-y-0 right-0 w-px bg-[color:var(--line)]" />
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
        <span
          aria-hidden="true"
          className="absolute -right-1 h-0.5 w-6 -translate-y-1/2 bg-amber shadow-[0_0_10px_var(--color-amber)]"
          style={{ bottom: `${marker}%` }}
        />
      </div>
      <p className="mt-4 font-mono text-sm text-starlight">
        10{superscript(exponent)} m
      </p>
      <p className="mt-1 font-sans text-xs text-dust">
        {readCopy(dict, "journey.rulerTitle")}
      </p>
      <p className="mt-3 max-w-[16rem] font-sans text-xs leading-relaxed text-dust">
        {readCopy(dict, "journey.rulerNote")}
      </p>
    </div>
  );
}
