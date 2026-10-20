import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { CATEGORIES } from "@/features/explorer/categories";
import { PLANETS } from "@/features/explorer/planets";
import { SITE_URL, alternates } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    "",
    "explore",
    "explore/sky",
    "explore/gallery",
    "explore/exoplanet",
    "explore/planet",
    "cosmos-today",
    "calculators",
    "calendar",
    "numbers",
    "stardust",
    "solar-system-3d",
    "about",
    ...CATEGORIES.map((c) => `explore/${c.slug}`),
    ...PLANETS.map((p) => `explore/planet/${p.slug}`),
  ];

  return LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE_URL}/${locale}${path ? `/${path}` : ""}`,
      lastModified: now,
      alternates: { languages: alternates(path) },
    })),
  );
}
