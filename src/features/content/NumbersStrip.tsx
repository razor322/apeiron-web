import type { CosmicFact } from "@/lib/astronomy/models";
import type { Dictionary } from "@/i18n/en";
import { DataLabel } from "@/components/ui/DataLabel";
import { SourceLink } from "@/components/ui/SourceLink";

export function NumbersStrip({
  facts,
  dict,
}: {
  facts: CosmicFact[];
  dict: Dictionary;
}) {
  return (
    <ul className="flex flex-col gap-10">
      {facts.map((fact) => (
        <li key={fact.id} className="flex flex-col gap-3 border-b border-[color:var(--line)] pb-8">
          <DataLabel
            value={fact.displayValue}
            unit={fact.unit}
            label={fact.title}
            confidenceType={fact.confidenceType}
            dict={dict}
          />
          <p className="max-w-2xl font-sans text-sm text-dust">{fact.summary}</p>
          <SourceLink name={fact.sourceName} url={fact.sourceUrl} label={dict.common.source} />
        </li>
      ))}
    </ul>
  );
}
