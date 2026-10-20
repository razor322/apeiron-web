"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { getText } from "@/features/explorer/categories";
import { BODIES, bodyById, type BodyDef, type BodyId } from "./solar-system.data";
import type { SolarSystem } from "./SolarSystem";

// Where a body's "learn more" link goes: planets have a detail page, the Sun
// has the star topic, and the two dwarf planets fall back to the Explore index.
const PLANET_SLUGS = new Set([
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
]);

function learnMoreHref(locale: Locale, id: BodyId): string {
  if (PLANET_SLUGS.has(id)) return `/${locale}/explore/planet/${id}`;
  if (id === "sun") return `/${locale}/explore/star`;
  return `/${locale}/explore`;
}

// The localized display name for a body: the new solarSystem3d.body.* keys for
// the Sun and the dwarf planets, the explore.planets.* names for the rest. The
// info card and the 3D labels read from the same function, so they never drift.
function bodyName(dict: Dictionary, id: BodyId): string {
  const def = bodyById(id);
  if (!def) return id;
  const value = getText(dict, def.nameKey);
  return typeof value === "string" ? value : id;
}

type Status = "loading" | "ready" | "failed";

export function SolarSystem3D({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.solarSystem3d;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<SolarSystem | null>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [selected, setSelected] = useState<BodyId | null>(null);

  const nameFor = useCallback((id: BodyId) => bodyName(dict, id), [dict]);

  // Mount the scene once, client-only. The dynamic import keeps Three.js out of
  // the server bundle; the cancel flag plus dispose keep StrictMode's
  // double-mount from leaking a second renderer, RAF, or listeners.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let scene: SolarSystem | null = null;

    const reduceMotion =
      typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("./SolarSystem")
      .then(({ SolarSystem }) => {
        if (cancelled) return;
        scene = new SolarSystem(canvas, { labelFor: (id) => nameFor(id) });
        sceneRef.current = scene;
        scene.setTimeScale(1);
        scene.toggleOrbits(true);
        if (!reduceMotion) scene.start();
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [nameFor]);

  const withScene = useCallback((fn: (scene: SolarSystem) => void) => {
    const scene = sceneRef.current;
    if (scene) fn(scene);
  }, []);

  const onSelect = useCallback(
    (id: BodyId) => {
      setSelected(id);
      withScene((scene) => scene.focus(id));
    },
    [withScene],
  );

  const selectedDef = useMemo(
    () => (selected ? BODIES.find((b) => b.id === selected) : undefined),
    [selected],
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="font-sans text-sm leading-relaxed text-dust">{t.subline}</p>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col gap-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-[color:var(--line)] bg-[#04050a] sm:aspect-video">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={t.canvasAria}
              className="h-full w-full"
            />
            {status !== "ready" ? (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                {status === "failed" ? (
                  <p className="font-sans text-sm text-dust">{t.fallbackNote}</p>
                ) : (
                  <span className="font-mono text-xs uppercase tracking-wide text-dust">
                    {dict.common.loading}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:w-72">
          <nav aria-label={t.railLabel}>
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {BODIES.map((def) => (
                <li key={def.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(def.id)}
                    aria-current={selected === def.id ? "true" : undefined}
                    className={`min-h-11 w-full rounded-sm px-3 py-2 text-left font-sans text-sm transition-colors ${
                      selected === def.id
                        ? "text-amber"
                        : "text-starlight hover:text-amber"
                    }`}
                  >
                    {bodyName(dict, def.id)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <InfoCard locale={locale} dict={dict} def={selectedDef} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  locale,
  dict,
  def,
}: {
  locale: Locale;
  dict: Dictionary;
  def: BodyDef | undefined;
}) {
  const t = dict.solarSystem3d;
  if (!def) return null;

  const stats: { label: string; value: string }[] = [
    { label: t.info.type, value: def.copy.type },
    { label: t.info.atmosphere, value: def.copy.atmosphere },
    { label: t.info.distance, value: def.copy.distance },
    { label: t.info.orbit, value: def.copy.orbit },
    { label: t.info.day, value: def.copy.day },
    { label: t.info.temp, value: def.copy.temp },
  ];

  return (
    <div
      aria-live="polite"
      className="flex flex-col gap-4 rounded-sm border border-[color:var(--line)] p-4"
    >
      <h3 className="font-serif text-2xl text-starlight">{bodyName(dict, def.id)}</h3>
      <dl className="flex flex-col gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            <dt className="font-mono text-xs uppercase tracking-wide text-dust">
              {stat.label}
            </dt>
            <dd className="font-sans text-sm text-starlight">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <p className="font-serif text-base leading-relaxed text-starlight">{def.copy.fact}</p>
      <Link
        href={learnMoreHref(locale, def.id)}
        className="font-sans text-sm text-amber underline"
      >
        {t.info.learnMore}
      </Link>
    </div>
  );
}
