import { PLANETS } from "@/features/explorer/planets";

// Real diameters span 4,879 km (Mercury) to 139,820 km (Jupiter), about 29x.
// On screen that reads as a speck beside a giant, so the measured diameter is
// compressed with a square root before scaling: the order survives, the range
// does not. Colours are the planets' familiar tints, chosen for identity, not
// measurement.
const MIN_RADIUS = 0.28;
const MAX_RADIUS = 1.1;
const SPACING = 2.2;

function diameterOf(slug: string): number {
  const planet = PLANETS.find((p) => p.slug === slug);
  const first = planet?.facts[0];
  return typeof first?.siValue === "number" ? first.siValue : 1;
}

const COLORS: Record<string, string> = {
  mercury: "#9a9a9a",
  venus: "#d9b382",
  earth: "#5b8dd6",
  mars: "#c1502e",
  jupiter: "#d8a97a",
  saturn: "#e0c68a",
  uranus: "#8fd3d6",
  neptune: "#5a76d6",
};

function radiusFor(slug: string): number {
  const r = Math.sqrt(diameterOf(slug));
  const min = Math.sqrt(4_879_000);
  const max = Math.sqrt(139_820_000);
  const t = (r - min) / (max - min);
  return MIN_RADIUS + t * (MAX_RADIUS - MIN_RADIUS);
}

export type PlanetGss = {
  id: string;
  slug: string;
  nameKey: string;
  radius: number;
  color: string;
  x: number;
};

export const PLANET_GSS: PlanetGss[] = PLANETS.map((planet, index) => ({
  id: `planet-${planet.slug}`,
  slug: planet.slug,
  nameKey: planet.nameKey,
  radius: radiusFor(planet.slug),
  color: COLORS[planet.slug] ?? "#cfcbc2",
  x: (index - (PLANETS.length - 1) / 2) * SPACING,
}));

export const SUN_GSS = { id: "sun", radius: 1.4, color: "#e8a15b" } as const;

export function planetGssFor(slug: string): PlanetGss | undefined {
  return PLANET_GSS.find((p) => p.slug === slug);
}
