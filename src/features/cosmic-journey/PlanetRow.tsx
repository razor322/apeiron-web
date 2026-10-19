import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { PLANETS } from "@/features/explorer/planets";
import { getText } from "@/features/explorer/categories";
import { readCopy } from "./stages";

// The eight planets as links into Explore. Names come from the existing
// explore.planets.* keys; the tagline rides along as a title so a reader who does
// not know the shapes still learns which world is which.
export function PlanetRow({
  locale,
  dict,
  className = "",
}: {
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-sans text-sm uppercase tracking-wide text-dust">
        {readCopy(dict, "journey.planets.heading")}
      </h3>
      <p className="mt-1 mb-4 max-w-[34rem] font-sans text-sm text-dust">
        {readCopy(dict, "journey.planets.intro")}
      </p>
      <ul className="flex flex-wrap gap-2">
        {PLANETS.map((planet) => {
          const name = String(getText(dict, planet.nameKey) ?? planet.slug);
          const tagline = String(getText(dict, planet.taglineKey) ?? "");
          return (
            <li key={planet.slug}>
              <Link
                href={`/${locale}/explore/planet/${planet.slug}`}
                title={tagline}
                className="block rounded-full border border-[color:var(--line)] px-3 py-1 font-sans text-xs text-dust transition-colors hover:border-amber hover:text-amber"
              >
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
