import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { CATEGORIES } from "@/features/explorer/categories";
import { SITE_URL, alternates } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    "",
    "explore",
    "cosmos-today",
    "about",
    ...CATEGORIES.map((c) => `explore/${c.slug}`),
  ];

  return LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE_URL}/${locale}${path ? `/${path}` : ""}`,
      lastModified: now,
      alternates: { languages: alternates(path) },
    })),
  );
}
