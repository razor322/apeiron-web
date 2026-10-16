import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/en";
import { getFact } from "@/features/cosmic-facts/facts";
import { DataLabel } from "@/components/ui/DataLabel";
import { SourceLink } from "@/components/ui/SourceLink";
import { Heading, Body } from "@/components/ui/Typography";
import { JourneyStageDef, readCopy } from "./stages";

type JourneyStageProps = {
  stage: JourneyStageDef;
  dict: Dictionary;
  style?: CSSProperties;
  ariaHidden?: boolean;
  className?: string;
};

// One stage of the journey: a text panel reading STAGES plus the sourced facts
// for that stage. All copy comes from dict, never canvas.
export function JourneyStage({
  stage,
  dict,
  style,
  ariaHidden,
  className = "",
}: JourneyStageProps) {
  const headingLevel = stage.kind === "hero" ? 1 : 2;
  const facts = stage.factIds
    .map((id) => getFact(id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <section
      id={`stage-${stage.id}`}
      aria-label={readCopy(dict, stage.ariaLabel)}
      aria-hidden={ariaHidden || undefined}
      style={style}
      className={className}
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-dust">
        {readCopy(dict, stage.label)}
      </p>
      <Heading level={headingLevel} className="mt-4 max-w-2xl">
        {readCopy(dict, `journey.stages.${stage.id}.headline`)}
      </Heading>
      <Body className="mt-5 max-w-xl text-dust">
        {readCopy(dict, `journey.stages.${stage.id}.body`)}
      </Body>
      {facts.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6">
          {facts.map((fact) => (
            <div key={fact.id} className="flex flex-col gap-2">
              <DataLabel
                value={fact.displayValue}
                unit={fact.unit}
                label={fact.title}
                confidenceType={fact.confidenceType}
                dict={dict}
              />
              <SourceLink
                name={fact.sourceName}
                url={fact.sourceUrl}
                label={dict.common.source}
              />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
