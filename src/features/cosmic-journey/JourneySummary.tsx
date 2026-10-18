"use client";

import type { Dictionary } from "@/i18n/en";
import { getFact } from "@/features/cosmic-facts/facts";
import { DataLabel } from "@/components/ui/DataLabel";
import { SourceLink } from "@/components/ui/SourceLink";
import { useJourneyLog } from "@/lib/journey-progress";
import { STAGES, MAX_EXPONENT, readCopy } from "./stages";

type Props = { dict: Dictionary };

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);
}

// The arrival panel. It reads the device-local list of opened stages and shows
// the span covered, the count opened, and the sourced facts for the stages that
// were opened. Every number here is either a constant defined in stages.ts or a
// fact already in the registry; nothing new is asserted.
export function JourneySummary({ dict }: Props) {
  const { visited } = useJourneyLog();
  const openedStages = STAGES.filter((stage) => visited.includes(stage.id));

  const factIds = Array.from(new Set(openedStages.flatMap((stage) => stage.factIds)));
  const facts = factIds
    .map((id) => getFact(id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  const complete = visited.length >= STAGES.length;

  return (
    <section
      aria-label={readCopy(dict, "journey.summary.heading")}
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-16"
    >
      <h2 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] text-starlight">
        {readCopy(dict, "journey.summary.heading")}
      </h2>
      <p className="max-w-2xl font-sans text-base leading-relaxed text-dust">
        {fill(readCopy(dict, "journey.summary.ordersLine"), { orders: String(MAX_EXPONENT) })}
      </p>
      <p className="font-mono text-sm text-dust">
        {fill(readCopy(dict, "journey.summary.stagesLine"), {
          visited: String(visited.length),
          total: String(STAGES.length),
        })}
      </p>

      {facts.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h3 className="font-sans text-sm uppercase tracking-wide text-dust">
            {readCopy(dict, "journey.summary.factsHeading")}
          </h3>
          <div className="flex flex-wrap gap-x-10 gap-y-6">
            {facts.map((fact) => (
              <div key={fact.id} className="flex flex-col gap-2">
                <DataLabel
                  value={fact.displayValue}
                  unit={fact.unit}
                  label={fact.title}
                  confidenceType={fact.confidenceType}
                  dict={dict}
                />
                <SourceLink name={fact.sourceName} url={fact.sourceUrl} label={dict.common.source} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <p className="max-w-2xl font-sans text-sm text-dust">
        {readCopy(
          dict,
          complete ? "journey.summary.complete" : "journey.summary.incomplete",
        )}
      </p>
    </section>
  );
}
