import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import type { NearEarthObject } from "@/lib/astronomy/models/neo";
import { formatLength } from "@/lib/astronomy/units/format";

// One upcoming close approach, from JPL. Distance is shown in AU and kilometres;
// the designation links to the JPL Small-Body Database lookup.
export function NearEarthRow({
  object,
  dict,
  locale,
}: {
  object: NearEarthObject;
  dict: Dictionary;
  locale: Locale;
}) {
  const t = dict.explore.nearEarth;
  const km = object.distanceAu * 149_597_870.7;
  return (
    <li className="flex flex-col gap-1 border-t border-[color:var(--line)] py-5">
      <a
        href={object.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-serif text-lg text-starlight underline decoration-[color:var(--line)] hover:text-amber"
      >
        {object.designation}
      </a>
      <span className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-dust">
        <span>
          {t.approach}: {object.approachDate}
        </span>
        <span>
          {t.distance}: {object.distanceAu.toFixed(4)} AU ({formatLength(km, locale)})
        </span>
        <span>
          {t.velocity}: {object.velocityKms.toFixed(1)} km/s
        </span>
      </span>
    </li>
  );
}
