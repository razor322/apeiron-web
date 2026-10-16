"use client";

import { useState } from "react";
import type { AstronomyMedia } from "@/lib/astronomy/models";
import type { Dictionary } from "@/i18n/en";

export function PlanetImage({ image, dict }: { image: AstronomyMedia; dict: Dictionary }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        data-testid="planet-image-fallback"
        role="img"
        aria-label={image.altText}
        className="flex aspect-[4/3] w-full items-center justify-center rounded-sm border border-[color:var(--line)] bg-[radial-gradient(circle_at_35%_30%,rgba(232,161,91,0.28),transparent_60%)]"
      >
        <span className="font-sans text-sm text-dust">{dict.explore.planet.facts}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.previewUrl}
      alt={image.altText}
      onError={() => setFailed(true)}
      className="aspect-[4/3] w-full rounded-sm border border-[color:var(--line)] object-cover"
    />
  );
}
