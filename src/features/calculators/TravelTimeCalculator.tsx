"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { travelTime } from "@/features/calculators/travel-time";
import { formatDuration } from "@/lib/astronomy/units/format";
import { ErrorState } from "@/components/ui/ErrorState";

type Props = { dict: Dictionary; locale: Locale };

export function TravelTimeCalculator({ dict, locale }: Props) {
  const t = dict.calculators.travelTime;
  const [distanceKm, setDistanceKm] = useState("149600000");
  const [speedKms, setSpeedKms] = useState("299792.458");

  const distance = Number(distanceKm);
  const speed = Number(speedKms);
  let duration: string | null = null;
  let note = travelTime(0, 1).assumptionNote;
  let error = "";

  if (distanceKm.trim() === "" || speedKms.trim() === "") {
    error = t.errorNonNumeric;
  } else if (!Number.isFinite(distance) || !Number.isFinite(speed)) {
    error = t.errorNonNumeric;
  } else if (distance < 0) {
    error = t.errorDistance;
  } else if (speed <= 0) {
    error = t.errorSpeed;
  } else {
    const r = travelTime(distance * 1000, speed * 1000);
    duration = formatDuration(r.seconds, locale);
    note = r.assumptionNote;
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-serif text-2xl text-starlight">{t.heading}</h3>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 font-sans text-sm text-dust">
          {t.distanceLabel}
          <input
            type="number"
            min="0"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="rounded border border-[color:var(--line)] bg-transparent px-3 py-2 font-mono text-base text-starlight"
          />
        </label>
        <label className="flex flex-col gap-1 font-sans text-sm text-dust">
          {t.speedLabel}
          <input
            type="number"
            min="0"
            value={speedKms}
            onChange={(e) => setSpeedKms(e.target.value)}
            className="rounded border border-[color:var(--line)] bg-transparent px-3 py-2 font-mono text-base text-starlight"
          />
        </label>
      </div>
      {error ? (
        <ErrorState title={error} />
      ) : (
        <span className="font-mono text-4xl text-starlight">
          {duration}
          <span className="ml-2 text-xl text-dust">{t.resultLabel}</span>
        </span>
      )}
      {/* Assumptions always render, result or error (R-12 / brief step 3). */}
      <p className="font-sans text-sm text-dust">{note}</p>
    </div>
  );
}
