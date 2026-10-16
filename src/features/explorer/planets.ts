import type { ConfidenceType } from "@/lib/astronomy/models";
import type { Locale } from "@/i18n/config";
import { formatLength, formatPeriod } from "@/lib/astronomy/units/format";

export type FactKind = "length" | "period" | "temperature" | "count";

export type PlanetFact = {
  metricKey: string;
  kind: FactKind;
  siValue: number;
  confidenceType: ConfidenceType;
};

export type PlanetProfile = {
  slug: string;
  nameKey: string;
  taglineKey: string;
  narrativeKey: string;
  facts: PlanetFact[];
  relatedSlugs: string[];
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
};

// Values are canonical SI: lengths in metres, periods in seconds, temperature in
// degrees Celsius, counts as integers. Numbers follow NASA Solar System
// Exploration fact sheets (science.nasa.gov/<planet>/facts/), verified 2026-10-16.
const MEASURED: ConfidenceType = "measured";

function facts(
  diameter: number,
  distance: number,
  periodSeconds: number,
  tempC: number,
  moons: number,
): PlanetFact[] {
  return [
    { metricKey: "diameter", kind: "length", siValue: diameter, confidenceType: MEASURED },
    { metricKey: "distanceFromSun", kind: "length", siValue: distance, confidenceType: MEASURED },
    { metricKey: "orbitalPeriod", kind: "period", siValue: periodSeconds, confidenceType: MEASURED },
    { metricKey: "meanTemp", kind: "temperature", siValue: tempC, confidenceType: MEASURED },
    { metricKey: "moons", kind: "count", siValue: moons, confidenceType: MEASURED },
  ];
}

const DAY = 86400;
const YEAR = 31557600;

export const PLANETS: PlanetProfile[] = [
  { slug: "mercury", nameKey: "explore.planets.mercury.name", taglineKey: "explore.planets.mercury.tagline", narrativeKey: "explore.planets.mercury.narrative", facts: facts(4_879_000, 5.79e10, 88 * DAY, 167, 0), relatedSlugs: ["venus", "mars", "earth"], sourceName: "NASA Solar System Exploration", sourceUrl: "https://science.nasa.gov/mercury/facts/", verifiedAt: "2026-10-16" },
  { slug: "venus", nameKey: "explore.planets.venus.name", taglineKey: "explore.planets.venus.tagline", narrativeKey: "explore.planets.venus.narrative", facts: facts(12_104_000, 1.082e11, 224.7 * DAY, 464, 0), relatedSlugs: ["mercury", "earth", "mars"], sourceName: "NASA Solar System Exploration", sourceUrl: "https://science.nasa.gov/venus/facts/", verifiedAt: "2026-10-16" },
  { slug: "earth", nameKey: "explore.planets.earth.name", taglineKey: "explore.planets.earth.tagline", narrativeKey: "explore.planets.earth.narrative", facts: facts(12_756_000, 1.496e11, 365.25 * DAY, 15, 1), relatedSlugs: ["mars", "venus", "mercury"], sourceName: "NASA Solar System Exploration", sourceUrl: "https://science.nasa.gov/earth/facts/", verifiedAt: "2026-10-16" },
  { slug: "mars", nameKey: "explore.planets.mars.name", taglineKey: "explore.planets.mars.tagline", narrativeKey: "explore.planets.mars.narrative", facts: facts(6_779_000, 2.279e11, 687 * DAY, -65, 2), relatedSlugs: ["earth", "jupiter", "venus"], sourceName: "NASA Solar System Exploration", sourceUrl: "https://science.nasa.gov/mars/facts/", verifiedAt: "2026-10-16" },
  { slug: "jupiter", nameKey: "explore.planets.jupiter.name", taglineKey: "explore.planets.jupiter.tagline", narrativeKey: "explore.planets.jupiter.narrative", facts: facts(139_820_000, 7.785e11, 11.9 * YEAR, -110, 95), relatedSlugs: ["saturn", "mars", "uranus"], sourceName: "NASA Solar System Exploration", sourceUrl: "https://science.nasa.gov/jupiter/facts/", verifiedAt: "2026-10-16" },
  { slug: "saturn", nameKey: "explore.planets.saturn.name", taglineKey: "explore.planets.saturn.tagline", narrativeKey: "explore.planets.saturn.narrative", facts: facts(116_460_000, 1.434e12, 29.4 * YEAR, -140, 146), relatedSlugs: ["jupiter", "uranus", "neptune"], sourceName: "NASA Solar System Exploration", sourceUrl: "https://science.nasa.gov/saturn/facts/", verifiedAt: "2026-10-16" },
  { slug: "uranus", nameKey: "explore.planets.uranus.name", taglineKey: "explore.planets.uranus.tagline", narrativeKey: "explore.planets.uranus.narrative", facts: facts(50_724_000, 2.871e12, 84 * YEAR, -195, 28), relatedSlugs: ["neptune", "saturn", "jupiter"], sourceName: "NASA Solar System Exploration", sourceUrl: "https://science.nasa.gov/uranus/facts/", verifiedAt: "2026-10-16" },
  { slug: "neptune", nameKey: "explore.planets.neptune.name", taglineKey: "explore.planets.neptune.tagline", narrativeKey: "explore.planets.neptune.narrative", facts: facts(49_244_000, 4.495e12, 165 * YEAR, -200, 16), relatedSlugs: ["uranus", "saturn", "jupiter"], sourceName: "NASA Solar System Exploration", sourceUrl: "https://science.nasa.gov/neptune/facts/", verifiedAt: "2026-10-16" },
];

export function getPlanet(slug: string): PlanetProfile | undefined {
  return PLANETS.find((p) => p.slug === slug);
}

const COUNTS: Record<Locale, string> = { en: "en-US", id: "id-ID" };

export function formatFact(fact: PlanetFact, locale: Locale): string {
  switch (fact.kind) {
    case "length":
      return formatLength(fact.siValue, locale);
    case "period":
      return formatPeriod(fact.siValue, locale);
    case "temperature":
      return `${new Intl.NumberFormat(COUNTS[locale], { maximumFractionDigits: 0 }).format(fact.siValue)}\u00B0C`;
    case "count":
      return new Intl.NumberFormat(COUNTS[locale]).format(fact.siValue);
  }
}
