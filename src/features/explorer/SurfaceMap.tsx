"use client";

import { useState } from "react";
import { trekGrid, type TrekLayer } from "@/lib/astronomy/providers/trek";

// A 2x2 mosaic of NASA Trek surface tiles. Loaded lazily from trek.nasa.gov; if
// the tiles fail, a labelled fallback shows so the section never looks broken.
export function SurfaceMap({ layer }: { layer: TrekLayer }) {
  const { tiles } = trekGrid(layer);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${layer.label} surface map unavailable`}
        className="flex aspect-square w-full max-w-md items-center justify-center rounded-sm border border-[color:var(--line)] bg-[radial-gradient(circle_at_35%_30%,rgba(232,161,91,0.28),transparent_60%)] font-sans text-sm text-dust"
      >
        {layer.label}
      </div>
    );
  }

  return (
    <figure className="flex flex-col gap-2">
      <div className="grid aspect-square w-full max-w-md grid-cols-2 grid-rows-2 overflow-hidden rounded-sm border border-[color:var(--line)]">
        {tiles.map((tile) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={tile.url}
            src={tile.url}
            alt={tile.alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ))}
      </div>
      <figcaption className="font-sans text-xs text-dust">
        {layer.credit}{" "}
        <a
          href={layer.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber underline"
        >
          NASA Trek
        </a>
      </figcaption>
    </figure>
  );
}
