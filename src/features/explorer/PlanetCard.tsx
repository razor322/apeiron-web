import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { getText } from "@/features/explorer/categories";
import { formatFact, type PlanetProfile } from "@/features/explorer/planets";

export function PlanetCard({
  planet,
  dict,
  locale,
}: {
  planet: PlanetProfile;
  dict: Dictionary;
  locale: Locale;
}) {
  const name = getText(dict, planet.nameKey) as string;
  const tagline = getText(dict, planet.taglineKey) as string;
  const diameter = planet.facts.find((f) => f.metricKey === "diameter");
  const href = `/${locale}/explore/planet/${planet.slug}`;

  return (
    <a href={href} className="group flex flex-col gap-3 border-t border-[color:var(--line)] pt-5">
      {/* CSS-generated specimen motif: no fabricated photo in the index list. */}
      <span
        aria-hidden
        className="h-16 w-16 rounded-full border border-[color:var(--line)] bg-[radial-gradient(circle_at_35%_30%,rgba(232,161,91,0.28),transparent_60%)] transition-colors group-hover:border-amber"
      />
      <span className="font-sans text-base text-starlight group-hover:text-amber">{name}</span>
      <span className="font-sans text-sm text-dust">{tagline}</span>
      {diameter ? (
        <span className="font-mono text-xs text-dust">{formatFact(diameter, locale)}</span>
      ) : null}
    </a>
  );
}
