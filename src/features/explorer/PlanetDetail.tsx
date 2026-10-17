import type { Dictionary } from "@/i18n/en";
import Link from "next/link";
import { getText } from "@/features/explorer/categories";
import { formatFact, getPlanet, type PlanetProfile } from "@/features/explorer/planets";
import { getPlanetImage } from "@/features/explorer/planet-images";
import { PlanetImage } from "@/features/explorer/PlanetImage";
import { DataLabel } from "@/components/ui/DataLabel";
import { SourceLink } from "@/components/ui/SourceLink";
import { ImageCredit } from "@/components/ui/ImageCredit";
import { Heading, Body, Label } from "@/components/ui/Typography";

export function PlanetDetail({
  planet,
  dict,
  locale,
}: {
  planet: PlanetProfile;
  dict: Dictionary;
  locale: string;
}) {
  const image = getPlanetImage(planet.slug);
  const name = getText(dict, planet.nameKey) as string;
  const tagline = getText(dict, planet.taglineKey) as string;
  const narrative = getText(dict, planet.narrativeKey) as string;
  const metricLabel = (metricKey: string) =>
    getText(dict, `explore.planetMetrics.${metricKey}`) as string;

  return (
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-3 border-b border-[color:var(--line)] pb-6">
        <Label>{dict.explore.categories.planet.name}</Label>
        <Heading level={1}>{name}</Heading>
        <Body className="max-w-2xl text-dust">{tagline}</Body>
      </header>

      {image ? (
        <section className="flex flex-col gap-2">
          <PlanetImage image={image} dict={dict} />
          <ImageCredit credit={image.credit} sourceUrl={image.sourceUrl} />
        </section>
      ) : null}

      <section className="flex flex-col gap-6">
        <Heading level={2} className="text-xl">
          {dict.explore.planet.facts}
        </Heading>
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {planet.facts.map((fact) => (
            <li key={fact.metricKey}>
              <DataLabel
                value={formatFact(fact, locale === "id" ? "id" : "en")}
                label={metricLabel(fact.metricKey)}
                confidenceType={fact.confidenceType}
                dict={dict}
              />
            </li>
          ))}
        </ul>
        <SourceLink
          name={planet.sourceName}
          url={planet.sourceUrl}
          label={`${planet.sourceName} (verified ${planet.verifiedAt})`}
        />
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2} className="text-xl">
          {dict.explore.planet.narrative}
        </Heading>
        <Body className="max-w-prose">{narrative}</Body>
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2} className="text-xl">
          {dict.explore.planet.related}
        </Heading>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {planet.relatedSlugs.map((slug) => {
            const related = getPlanet(slug);
            if (!related) return null;
            return (
              <li key={slug}>
                <Link
                  href={`/${locale}/explore/planet/${slug}`}
                  className="font-sans text-sm text-starlight underline decoration-[color:var(--line)] hover:text-amber"
                >
                  {getText(dict, related.nameKey) as string}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}
