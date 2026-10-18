"use client";

import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { PLANET_ORBITS, planetAge } from "@/features/calculators/planet-age";
import { ErrorState } from "@/components/ui/ErrorState";

type Props = { dict: Dictionary; locale: Locale };

const DEFAULT_AGE = "30";
const DEFAULT_PLANET = "Mars";

export function parseAgeQuery(search: string): { age: string; planet: string } {
  const params = new URLSearchParams(search);
  const rawAge = params.get("age") ?? "";
  const numeric = Number(rawAge);
  const age =
    rawAge.trim() !== "" && Number.isFinite(numeric) && numeric >= 0 ? rawAge : DEFAULT_AGE;
  const planetParam = params.get("planet") ?? "";
  const planet = PLANET_ORBITS.some((p) => p.name === planetParam) ? planetParam : DEFAULT_PLANET;
  return { age, planet };
}

export function ageQuery(age: string, planet: string): string {
  const params = new URLSearchParams({ age, planet });
  return `?${params.toString()}`;
}

export function PlanetAgeCalculator({ dict }: Props) {
  const t = dict.calculators.planetAge;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = parseAgeQuery(searchParams.toString());
  const [age, setAge] = useState(initial.age);
  const [planet, setPlanet] = useState(initial.planet);

  useEffect(() => {
    router.replace(`${pathname}${ageQuery(age, planet)}`, { scroll: false });
  }, [age, planet, pathname, router]);

  const numeric = Number(age);
  let years: number | null = null;
  let formula = "";
  let error = "";

  if (age.trim() === "") {
    error = t.errorPositive;
  } else if (!Number.isFinite(numeric)) {
    error = t.errorNonNumeric;
  } else if (numeric < 0) {
    error = t.errorPositive;
  } else {
    const r = planetAge(numeric, planet);
    years = r.years;
    formula = r.formula;
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-serif text-2xl text-starlight">{t.heading}</h3>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 font-sans text-sm text-dust">
          {t.ageLabel}
          <input
            type="number"
            min="0"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="rounded border border-[color:var(--line)] bg-transparent px-3 py-2 font-mono text-base text-starlight"
          />
        </label>
        <label className="flex flex-col gap-1 font-sans text-sm text-dust">
          {t.planetLabel}
          <select
            value={planet}
            onChange={(e) => setPlanet(e.target.value)}
            className="rounded border border-[color:var(--line)] bg-void px-3 py-2 font-sans text-base text-starlight"
          >
            {PLANET_ORBITS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? (
        <ErrorState title={error} />
      ) : (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-4xl text-starlight">
            {years!.toFixed(1)}
            <span className="ml-2 text-xl text-dust">{t.resultLabel}</span>
          </span>
          <span className="font-sans text-sm text-dust">{formula}</span>
        </div>
      )}
    </div>
  );
}
