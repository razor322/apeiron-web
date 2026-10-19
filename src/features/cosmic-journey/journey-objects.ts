import type { AstronomyMedia } from "@/lib/astronomy/models";
import { PLANET_IMAGES } from "@/features/explorer/planet-images";
import { getCategoryImage } from "@/features/explorer/category-images";
import { getJourneyImage } from "./journey-images";

export type JourneyObject = {
  id: string;
  nameKey: string;
  image: AstronomyMedia | undefined;
  href: string;
};

const PLANET_SLUGS = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];
const STAR_IDS = ["proxima", "alphaCentauri", "sirius", "barnard"];

// The objects a reader can meet on the journey, each with a name key, a real
// image, and a route. The canvas draws them; this registry gives them identity.
export const JOURNEY_OBJECTS: JourneyObject[] = [
  ...PLANET_SLUGS.map((slug) => ({
    id: `planet-${slug}`,
    nameKey: `explore.planets.${slug}.name`,
    image: PLANET_IMAGES[slug],
    href: `planet/${slug}`,
  })),
  ...STAR_IDS.map((s) => ({
    id: `star-${s}`,
    nameKey: `journey.stars.${s}`,
    image: getCategoryImage("star"),
    href: "star",
  })),
  { id: "sun", nameKey: "journey.objects.sun", image: getJourneyImage("star"), href: "star" },
  { id: "moon", nameKey: "journey.objects.moon", image: getJourneyImage("earth"), href: "planet/earth" },
  { id: "galaxy", nameKey: "journey.stages.galaxy.label", image: getJourneyImage("galaxy"), href: "galaxy" },
];

export function getJourneyObject(id: string): JourneyObject | undefined {
  return JOURNEY_OBJECTS.find((o) => o.id === id);
}

// A canvas id to a route under /explore.
export function slugForId(id: string): string {
  const object = getJourneyObject(id);
  return object ? object.href : "planet";
}
