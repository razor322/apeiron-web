export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function metadataBase(): URL {
  return new URL(SITE_URL);
}

// Language alternates for the two locales. en is the x-default.
export function alternates(path = ""): Record<string, string> {
  const suffix = path ? `/${path.replace(/^\//, "")}` : "";
  return {
    en: `/en${suffix}`,
    id: `/id${suffix}`,
    "x-default": `/en${suffix}`,
  };
}

type MetaCopy = { siteName: string };
type MetaSection = { title: string; description: string };

// Shared route metadata: dictionary-driven title/description plus en/id alternates.
export function routeMetadata(
  meta: MetaCopy,
  section: MetaSection,
  path = "",
): import("next").Metadata {
  return {
    title: section.title,
    description: section.description,
    openGraph: {
      title: section.title,
      description: section.description,
      siteName: meta.siteName,
      type: "website",
    },
    alternates: { languages: alternates(path) },
  };
}
