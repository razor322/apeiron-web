import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { searchNasaImages } from "@/lib/astronomy/providers/nasa-images";
import { fetchApodList } from "@/lib/astronomy/providers/nasa-apod";
import type { AstronomyMedia } from "@/lib/astronomy/models";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Heading, Body } from "@/components/ui/Typography";
import { GalleryGrid } from "@/features/explorer/GalleryGrid";
import { ApodListItem } from "@/features/cosmos-today/ApodListItem";

export const revalidate = 21600;

// Fixed, curated queries: the gallery is a small, sourced selection, not a live
// search box. Keys resolve to dict copy for the heading.
const QUERIES = ["nebula", "galaxy", "jupiter", "saturn", "mars", "earth"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return routeMetadata(
    dict.meta,
    { title: `Apeiron: ${dict.explore.gallery.heading}`, description: dict.explore.gallery.intro },
    "explore/gallery",
  );
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  // Fetch each curated query (cached 24h); a failure for one query drops only
  // that group, never the page.
  const groups = await Promise.all(
    QUERIES.map(async (q) => {
      try {
        const snap = await searchNasaImages(q, 6);
        return { q, media: snap.data };
      } catch {
        return { q, media: [] as AstronomyMedia[] };
      }
    }),
  );

  let recent: Awaited<ReturnType<typeof fetchApodList>>["data"] = [];
  try {
    recent = (await fetchApodList(6)).data;
  } catch {
    recent = [];
  }

  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Button href={`/${locale}/explore`} variant="ghost">
          {dict.explore.planet.backToExplore}
        </Button>
        <header className="flex flex-col gap-3">
          <Heading level={1}>{dict.explore.gallery.heading}</Heading>
          <Body className="max-w-2xl text-dust">{dict.explore.gallery.intro}</Body>
        </header>

        {groups.map(({ q, media }) => (
          <GalleryGrid key={q} title={dict.explore.gallery.queries[q]} media={media} />
        ))}

        {recent.length > 0 ? (
          <section className="flex flex-col gap-2 border-t border-[color:var(--line)] pt-10">
            <h2 className="font-serif text-2xl text-starlight">
              {dict.explore.recent.heading}
            </h2>
            <Body className="max-w-2xl text-dust">{dict.explore.recent.intro}</Body>
            <ul className="flex flex-col">
              {recent.map((item) => (
                <li key={item.id}>
                  <ApodListItem media={item} dict={dict} />
                </li>
              ))}
            </ul>
            <a
              href={`/${locale}/cosmos-today`}
              className="mt-2 font-sans text-sm text-amber underline"
            >
              {dict.explore.recent.cta}
            </a>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
