import type { Dictionary } from "@/i18n/en";
import { STAGES, readCopy } from "./stages";
import { JourneyResetButton } from "./JourneyResetButton";
import { useJourneyLog } from "@/lib/journey-progress";

type JourneyProgressProps = {
  activeIndex: number;
  goTo: (index: number) => void;
  dict: Dictionary;
  className?: string;
};

// One focusable control per stage. The accessible name comes from the
// dictionary; aria-current="step" marks the stage the reader is on. A stage the
// reader has already opened keeps its number in amber and a filled marker under
// it, but the group stays one control per stage, unchanged for screen readers.
export function JourneyProgress({
  activeIndex,
  goTo,
  dict,
  className = "",
}: JourneyProgressProps) {
  const { visited } = useJourneyLog();

  return (
    <nav aria-label={readCopy(dict, "journey.navLabel")} className={className}>
      <ol className="flex items-center gap-1 sm:gap-2">
        {STAGES.map((stage, index) => {
          const active = index === activeIndex;
          const seen = visited.includes(stage.id);
          const tone = active
            ? "border border-amber text-amber"
            : seen
              ? "border border-amber/60 text-amber"
              : "border border-[color:var(--line)] text-dust hover:border-amber hover:text-amber";
          return (
            <li key={stage.id} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => goTo(index)}
                aria-current={active ? "step" : undefined}
                data-visited={seen ? "true" : undefined}
                className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs transition-colors sm:h-9 sm:w-9 ${tone}`}
              >
                <span className="sr-only">{readCopy(dict, stage.ariaLabel)}</span>
                <span aria-hidden="true">{index + 1}</span>
              </button>
              <span
                aria-hidden="true"
                className={`h-1 w-1 rounded-full ${seen ? "bg-amber" : "bg-transparent"}`}
              />
            </li>
          );
        })}
      </ol>
      <JourneyResetButton dict={dict} />
    </nav>
  );
}
