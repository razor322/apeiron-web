import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/en";
import { getFact } from "@/features/cosmic-facts/facts";
import { DataLabel } from "@/components/ui/DataLabel";
import { SourceLink } from "@/components/ui/SourceLink";
import { JourneyStageDef, readCopy } from "./stages";

type JourneyStageProps = {
  stage: JourneyStageDef;
  dict: Dictionary;
  style?: CSSProperties;
  ariaHidden?: boolean;
  className?: string;
};

// One stage of the journey. Copy comes from dict; the accessible story lives in
// these DOM panels, never the canvas. Layout varies by kind: the hero and mid
// transition are centred and typographic, content stages sit bottom-left with a
// giant editorial figure, exactly as the prototype frames them.
export function JourneyStage({
  stage,
  dict,
  style,
  ariaHidden,
  className = "",
}: JourneyStageProps) {
  const headingLevel = stage.kind === "hero" ? 1 : 2;
  const figure = stage.figureKey ? readCopy(dict, stage.figureKey) : "";
  const headline = readCopy(dict, `journey.stages.${stage.id}.headline`);
  const body = readCopy(dict, `journey.stages.${stage.id}.body`);
  const facts = stage.factIds
    .map((id) => getFact(id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  // Centred, frameless stages: the hero and the mid transition.
  if (stage.kind === "hero" || stage.kind === "mid") {
    const isHero = stage.kind === "hero";
    return (
      <section
        id={`stage-${stage.id}`}
        aria-label={readCopy(dict, stage.ariaLabel)}
        aria-hidden={ariaHidden || undefined}
        style={style}
        className={`${className} text-center`}
      >
        {isHero ? (
          <h1 className="font-serif text-[clamp(3.4rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.015em] text-starlight">
            {headline}
          </h1>
        ) : (
          <p className="font-serif text-[clamp(1.8rem,4.2vw,3.4rem)] italic leading-[1.1] text-starlight">
            {headline}
          </p>
        )}
        {body ? (
          <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-dust">
            {body}
          </p>
        ) : null}
        {isHero ? (
          <span
            aria-hidden="true"
            className="mx-auto mt-8 block h-11 w-px bg-gradient-to-b from-dust to-transparent"
          />
        ) : null}
      </section>
    );
  }

  return (
    <section
      id={`stage-${stage.id}`}
      aria-label={readCopy(dict, stage.ariaLabel)}
      aria-hidden={ariaHidden || undefined}
      style={style}
      className={className}
    >
      {figure ? (
        <p className="font-serif text-[clamp(3.2rem,9vw,7.5rem)] leading-[0.95] tracking-[-0.01em] text-starlight">
          {figure}
        </p>
      ) : null}
      {headingLevel === 2 ? (
        <h2 className="mt-4 max-w-[26em] font-serif text-[clamp(1.25rem,2.1vw,1.75rem)] leading-[1.25] text-starlight">
          {headline}
        </h2>
      ) : (
        <h1 className="mt-4 max-w-[26em] font-serif text-[clamp(1.25rem,2.1vw,1.75rem)] leading-[1.25] text-starlight">
          {headline}
        </h1>
      )}
      {body ? (
        <p className="mt-5 max-w-[28rem] font-sans font-light text-base leading-[1.65] text-dust">
          {body}
        </p>
      ) : null}

      {facts.length > 0 ? (
        <details className="mt-6 max-w-[28rem] font-sans text-sm text-dust">
          <summary className="cursor-pointer select-none text-dust transition-colors hover:text-starlight">
            {readCopy(dict, "common.sourcesToggle")}
          </summary>
          <div className="mt-4 flex flex-wrap gap-x-10 gap-y-6">
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
        </details>
      ) : null}
    </section>
  );
}
