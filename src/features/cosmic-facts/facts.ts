import type { CosmicFact, ScaleStage } from "@/lib/astronomy/models";

export const COSMIC_FACTS: CosmicFact[] = [
  {
    id: "earth-diameter",
    title: "Diameter of Earth",
    value: 12756,
    displayValue: "12,756",
    unit: "km",
    summary: "Earth's equatorial diameter is 12,756 kilometres.",
    scaleStage: "earth",
    confidenceType: "measured",
    sourceName: "NASA Solar System Exploration",
    sourceUrl: "https://science.nasa.gov/earth/facts/",
    verifiedAt: "2026-10-14",
  },
  {
    id: "earth-moon-distance",
    title: "Earth to Moon",
    value: 384400,
    displayValue: "384,400",
    unit: "km",
    summary: "The average distance from Earth to the Moon is 384,400 kilometres.",
    scaleStage: "earth",
    confidenceType: "measured",
    sourceName: "NASA",
    sourceUrl: "https://science.nasa.gov/moon/facts/",
    verifiedAt: "2026-10-14",
  },
  {
    id: "sunlight-earth",
    title: "Sunlight travel time to Earth",
    value: "8 min 20 s",
    displayValue: "8 min 20 s",
    summary: "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
    scaleStage: "solar-system",
    confidenceType: "calculated",
    sourceName: "NASA",
    sourceUrl: "https://science.nasa.gov/sun/facts/",
    verifiedAt: "2026-10-14",
    methodologyNote:
      "Derived from the mean Earth-Sun distance (1 AU, about 149.6 million km) divided by the speed of light (299,792 km/s), giving about 499 seconds.",
  },
  {
    id: "sun-neptune-light",
    title: "Sunlight travel time to Neptune",
    value: "4.2 h",
    displayValue: "4.2 h",
    summary: "Light from the Sun takes about 4.2 hours to reach Neptune.",
    scaleStage: "solar-system",
    confidenceType: "calculated",
    sourceName: "NASA",
    sourceUrl: "https://science.nasa.gov/neptune/facts/",
    verifiedAt: "2026-10-14",
    methodologyNote:
      "Derived from Neptune's mean orbital distance (about 30 AU, roughly 4.5 billion km) divided by the speed of light (299,792 km/s), giving about 4.2 hours.",
  },
  {
    id: "milky-way-position",
    title: "Where the Sun sits in the Milky Way",
    displayValue: "about halfway out",
    summary:
      "Earth is located along one of the Milky Way's spiral arms, about halfway from the centre of the galaxy.",
    scaleStage: "galaxy",
    confidenceType: "approximate",
    sourceName: "NASA Science",
    sourceUrl: "https://science.nasa.gov/universe/galaxies/",
    verifiedAt: "2026-10-19",
  },
  {
    id: "galactic-centre-distance",
    title: "Distance to the galactic centre",
    value: 26000,
    displayValue: "about 26,000",
    unit: "light-years",
    summary:
      "The Solar System lies about 26,000 light-years from the centre of the Milky Way, where the supermassive black hole Sagittarius A* sits.",
    scaleStage: "galaxy",
    confidenceType: "approximate",
    sourceName: "ESA, Guide to our galaxy",
    sourceUrl: "https://www.esa.int/Science_Exploration/Space_Science/Gaia/Guide_to_our_Galaxy",
    verifiedAt: "2026-10-19",
    methodologyNote:
      "ESA's Gaia guide places the Sun at a distance of about 26,000 light-years from the Galactic Centre.",
  },
  {
    id: "milky-way-diameter",
    title: "Width of the Milky Way",
    value: 100000,
    displayValue: "more than 100,000",
    unit: "light-years",
    summary:
      "The Milky Way is a spiral galaxy whose disk of stars spans more than 100,000 light-years.",
    scaleStage: "galaxy",
    confidenceType: "measured",
    sourceName: "NASA Science",
    sourceUrl: "https://science.nasa.gov/universe/galaxies/",
    verifiedAt: "2026-10-19",
  },
  {
    id: "milky-way-orbit-time",
    title: "One orbit of the Milky Way",
    value: 240000000,
    displayValue: "about 240 million",
    unit: "years",
    summary: "The Solar System takes about 240 million years to orbit the Milky Way once.",
    scaleStage: "galaxy",
    confidenceType: "approximate",
    sourceName: "NASA Science",
    sourceUrl: "https://science.nasa.gov/universe/galaxies/",
    verifiedAt: "2026-10-19",
  },
  {
    id: "proxima-distance",
    title: "Distance to Proxima Centauri",
    value: 4.24,
    displayValue: "4.24",
    unit: "light-years",
    summary: "Proxima Centauri, the nearest star to the Sun, is about 4.24 light-years away.",
    scaleStage: "star",
    confidenceType: "measured",
    sourceName: "NASA",
    sourceUrl: "https://science.nasa.gov/sun/facts/",
    verifiedAt: "2026-10-14",
  },
];

export function getFact(id: string): CosmicFact | undefined {
  return COSMIC_FACTS.find((f) => f.id === id);
}

export function factsForStage(stage: ScaleStage): CosmicFact[] {
  return COSMIC_FACTS.filter((f) => f.scaleStage === stage);
}
