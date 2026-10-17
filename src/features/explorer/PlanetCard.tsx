"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { getText } from "@/features/explorer/categories";
import { formatFact, type PlanetProfile } from "@/features/explorer/planets";
import { getPlanetImage } from "@/features/explorer/planet-images";
import { ImageCredit } from "@/components/ui/ImageCredit";

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
  const image = getPlanetImage(planet.slug);
  const [failed, setFailed] = useState(false);
  const href = `/${locale}/explore/planet/${planet.slug}`;

  return (
    <div className="flex flex-col gap-3 border-t border-[color:var(--line)] pt-5">
      <Link href={href} className="group flex flex-col gap-3">
        {image && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.previewUrl}
            alt={image.altText}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="aspect-square w-full rounded-sm border border-[color:var(--line)] object-cover transition-colors group-hover:border-amber"
          />
        ) : (
          <span
            aria-hidden
            className="aspect-square w-full rounded-sm border border-[color:var(--line)] bg-[radial-gradient(circle_at_35%_30%,rgba(232,161,91,0.28),transparent_60%)] transition-colors group-hover:border-amber"
          />
        )}
        <span className="font-sans text-base text-starlight group-hover:text-amber">{name}</span>
        <span className="font-sans text-sm text-dust">{tagline}</span>
        {diameter ? (
          <span className="font-mono text-xs text-dust">{formatFact(diameter, locale)}</span>
        ) : null}
      </Link>
      {image && !failed ? (
        <ImageCredit credit={image.credit} sourceUrl={image.sourceUrl} link={false} />
      ) : null}
    </div>
  );
}
