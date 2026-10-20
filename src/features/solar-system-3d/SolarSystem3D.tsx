"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { PLANETS } from "@/features/explorer/planets";
import { getText } from "@/features/explorer/categories";
import { getPlanetImage } from "@/features/explorer/planet-images";
import { buildSceneSource } from "./scene-source";

// A turnable 3D row of globes, drawn by GSS on the GPU. The canvas is decorative;
// the list below is the real content, so the page reads for a screen reader and
// stands on a device with no GPU. When the scene cannot run (software rendering
// or a mount error) the canvas is dropped and only the list remains.
export function SolarSystem3D({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);
  const t = dict.solarSystem3d;

  useEffect(() => {
    let scene: { destroy: () => void } | undefined;
    let cancelled = false;
    (async () => {
      try {
        const { mount, softwareRendering } = await import("gss-lang");
        if (cancelled || !canvasRef.current) return;
        if (softwareRendering()) {
          setFailed(true);
          return;
        }
        scene = mount(canvasRef.current, buildSceneSource());
      } catch {
        setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      scene?.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {failed ? (
        <p className="font-sans text-sm text-dust">{t.fallbackNote}</p>
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="aspect-[16/9] w-full rounded-sm border border-[color:var(--line)] bg-void"
        />
      )}
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
