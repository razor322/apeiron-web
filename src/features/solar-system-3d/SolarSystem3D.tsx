"use client";

import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { PLANETS } from "@/features/explorer/planets";
import { getText } from "@/features/explorer/categories";
import { getPlanetImage } from "@/features/explorer/planet-images";

// Temporary placeholder while the Three.js scene is built (Phase 6 replaces this
// with the real interactive solar system). The accessible planet list is real
// content and stays.
export function SolarSystem3D({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.solarSystem3d;

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-sans text-sm uppercase tracking-wide text-dust">{t.listHeading}</h2>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANETS.map((planet) => {
          const image = getPlanetImage(planet.slug);
          return (
            <li key={planet.slug} className="flex flex-col gap-2">
              {image?.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.previewUrl}
                  alt={image.altText}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full rounded-sm object-cover"
                />
              ) : null}
              <span className="font-serif text-lg text-starlight">
                {String(getText(dict, planet.nameKey) ?? planet.slug)}
              </span>
              <Link
                href={`/${locale}/explore/planet/${planet.slug}`}
                className="font-sans text-xs text-amber underline"
              >
                {t.planetLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
