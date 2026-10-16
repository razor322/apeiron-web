export type Planet = {
  name: string;
  periodEarthYears: number;
};

export const PLANET_ORBITS: Planet[] = [
  { name: "Mercury", periodEarthYears: 0.241 },
  { name: "Venus", periodEarthYears: 0.615 },
  { name: "Earth", periodEarthYears: 1 },
  { name: "Mars", periodEarthYears: 1.881 },
  { name: "Jupiter", periodEarthYears: 11.86 },
  { name: "Saturn", periodEarthYears: 29.46 },
  { name: "Uranus", periodEarthYears: 84.01 },
  { name: "Neptune", periodEarthYears: 164.8 },
];

export type PlanetAgeResult = {
  years: number;
  formula: string;
};

export function planetAge(earthYears: number, planet: string): PlanetAgeResult {
  if (!Number.isFinite(earthYears) || earthYears < 0) {
    throw new Error("Enter a positive age in Earth years.");
  }
  const found = PLANET_ORBITS.find((p) => p.name === planet);
  if (!found) {
    throw new Error(`Unknown planet: ${planet}.`);
  }
  return {
    years: earthYears / found.periodEarthYears,
    formula: `Earth years divided by ${planet}'s orbital period (${found.periodEarthYears} Earth years).`,
  };
}
