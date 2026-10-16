export type Category = {
  slug: string;
  nameKey: string;
  summaryKey: string;
  factId?: string;
};

// English slugs are shared across locales; only the dictionary keys change per locale.
export const CATEGORIES: Category[] = [
  { slug: "planet", nameKey: "explore.categories.planet.name", summaryKey: "explore.categories.planet.summary", factId: "earth-diameter" },
  { slug: "star", nameKey: "explore.categories.star.name", summaryKey: "explore.categories.star.summary", factId: "proxima-distance" },
  { slug: "black-hole", nameKey: "explore.categories.black-hole.name", summaryKey: "explore.categories.black-hole.summary" },
  { slug: "nebula", nameKey: "explore.categories.nebula.name", summaryKey: "explore.categories.nebula.summary" },
  { slug: "galaxy", nameKey: "explore.categories.galaxy.name", summaryKey: "explore.categories.galaxy.summary" },
  { slug: "exoplanet", nameKey: "explore.categories.exoplanet.name", summaryKey: "explore.categories.exoplanet.summary" },
  { slug: "comet-asteroid", nameKey: "explore.categories.comet-asteroid.name", summaryKey: "explore.categories.comet-asteroid.summary" },
  { slug: "dark-matter", nameKey: "explore.categories.dark-matter.name", summaryKey: "explore.categories.dark-matter.summary" },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

// Dot-path lookup into a dictionary, e.g. "explore.categories.planet.name".
export function getText(dict: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, dict);
}

export function categoryName(dict: unknown, category: Category): string {
  return getText(dict, category.nameKey) as string;
}

export function categorySummary(dict: unknown, category: Category): string {
  return getText(dict, category.summaryKey) as string;
}
