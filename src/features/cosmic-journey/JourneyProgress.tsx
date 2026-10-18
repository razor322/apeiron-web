import type { Dictionary } from "@/i18n/en";
import { STAGES, readCopy } from "./stages";
import { JourneyResetButton } from "./JourneyResetButton";

type JourneyProgressProps = {
  activeIndex: number;
  goTo: (index: number) => void;
  dict: Dictionary;
  className?: string;
};

// One focusable control per stage. The accessible name comes from the
// dictionary; aria-current="step" marks the stage the reader is on. A stage the
// reader has opened keeps a filled marker, but the group stays one control per
// stage, unchanged for screen readers.
export function JourneyProgress({
  activeIndex,
  goTo,
  dict,
  className = "",
}: JourneyProgressProps) {
  return (
    <nav aria-label={readCopy(dict, "journey.navLabel")} className={className}>
      <ol className="flex items-center gap-1 sm:gap-2">
        {STAGES.map((stage, index) => {
          const active = index === activeIndex;
          return (
            <li key={stage.id}>
              <button
                type="button"
                onClick={() => goTo(index)}
                aria-current={active ? "step" : undefined}
                className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs transition-colors sm:h-9 sm:w-9 ${
                  active
                    ? "border border-amber text-amber"
                    : "border border-[color:var(--line)] text-dust hover:border-amber hover:text-amber"
                }`}
              >
                <span className="sr-only">{readCopy(dict, stage.ariaLabel)}</span>
                <span aria-hidden="true">{index + 1}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <JourneyResetButton dict={dict} />
    </nav>
  );
}
