import type { Dictionary } from "@/i18n/en";
import type { ExoplanetRow } from "@/lib/astronomy/schemas/exoplanet";
import { Heading, Body, Label } from "@/components/ui/Typography";
import { SourceLink } from "@/components/ui/SourceLink";

// One detected planet, rendered from an Exoplanet Archive row. Numbers are shown
// as the archive reports them; the archive is the source.
export function ExoplanetRowCard({ planet, dict }: { planet: ExoplanetRow; dict: Dictionary }) {
  const t = dict.explore.exoplanetPage;
  return (
    <li className="flex flex-col gap-2 border-t border-[color:var(--line)] py-5">
      <span className="font-serif text-lg text-starlight">{planet.pl_name}</span>
      <span className="font-sans text-sm text-dust">
        {planet.hostname ? `${t.hostStar}: ${planet.hostname}` : null}
      </span>
      <span className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-dust">
        {planet.disc_year ? (
          <span>
            {t.discovered}: {planet.disc_year}
          </span>
        ) : null}
        {planet.discoverymethod ? (
          <span>
            {t.method}: {planet.discoverymethod}
          </span>
        ) : null}
        {typeof planet.pl_orbper === "number" ? (
          <span>
            {t.orbit}: {planet.pl_orbper.toFixed(2)} {t.days}
          </span>
        ) : null}
        {typeof planet.pl_rade === "number" ? (
          <span>
            {t.radius}: {planet.pl_rade.toFixed(2)} {t.earthRadii}
          </span>
        ) : null}
      </span>
    </li>
  );
}

export function ExoplanetIntro({
  count,
  dict,
  locale,
}: {
  count: number;
  dict: Dictionary;
  locale: string;
}) {
  const t = dict.explore.exoplanetPage;
  const n = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US").format(count);
  return (
    <div className="flex flex-col gap-3">
      <Label>{dict.explore.categories.exoplanet.name}</Label>
      <Heading level={1}>{t.heading}</Heading>
      <Body className="max-w-2xl text-dust">{t.intro}</Body>
      <p className="font-mono text-3xl text-starlight">
        {n}
        <span className="ml-2 text-base text-dust">{t.confirmedLabel}</span>
      </p>
      <SourceLink name={t.sourceName} url={t.sourceUrl} label={t.sourceName} />
    </div>
  );
}
