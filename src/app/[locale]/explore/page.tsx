import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { fetchApodList } from "@/lib/astronomy/providers/nasa-apod";
import { fetchNearEarth } from "@/lib/astronomy/providers/near-earth";
import { fetchEarthToday } from "@/lib/astronomy/providers/epic";
import { Container } from "@/components/ui/Container";
import { Heading, Body } from "@/components/ui/Typography";
import { Skeleton } from "@/components/ui/Skeleton";
import { CategoryGrid } from "@/features/explorer/CategoryGrid";
import { NearEarthRow } from "@/features/explorer/NearEarthRow";
import { ApodListItem } from "@/features/cosmos-today/ApodListItem";

// The recent-images strip reuses the APOD feed; refresh with the same cadence as
// the Cosmos Today page.
export const revalidate = 21600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = await getDictionary(locale);
  return routeMetadata(meta, meta.explore, "explore");
}

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <Heading level={1}>{dict.explore.heading}</Heading>
          <Body className="max-w-2xl text-dust">{dict.explore.intro}</Body>
        </header>
        <CategoryGrid dict={dict} locale={locale} />
        <Suspense fallback={<RowsShimmer heading={dict.explore.nearEarth.heading} />}>
          <NearEarth dict={dict} locale={locale} />
        </Suspense>
        <Suspense fallback={<RowsShimmer heading={dict.explore.earthToday.heading} />}>
          <EarthToday dict={dict} />
        </Suspense>
        <Suspense fallback={<RecentShimmer dict={dict} locale={locale} />}>
          <RecentImages dict={dict} locale={locale} />
        </Suspense>
        <section className="flex flex-col gap-6 border-t border-[color:var(--line)] pt-10">
          <header className="flex flex-col gap-2">
            <Heading level={2}>{dict.explore.more.heading}</Heading>
            <Body className="max-w-2xl text-dust">{dict.explore.more.intro}</Body>
          </header>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-3">
            {[
              { href: "numbers", ...dict.explore.more.numbers },
              { href: "calendar", ...dict.explore.more.calendar },
              { href: "stardust", ...dict.explore.more.stardust },
              { href: "calculators", ...dict.explore.more.calculators },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={`/${locale}/${item.href}`}
                  className="flex flex-col gap-2 border border-[color:var(--line)] p-6 transition-colors hover:border-amber"
                >
                  <span className="font-serif text-xl text-starlight">{item.title}</span>
                  <span className="font-sans text-sm text-dust">{item.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </main>
  );
}

// Streamed separately so the shell and the category grid paint before the feed
// resolves. Fetches only four items.
async function RecentImages({ dict, locale }: { dict: Dictionary; locale: string }) {
  let recent: Awaited<ReturnType<typeof fetchApodList>>["data"] = [];
  try {
    recent = (await fetchApodList(4)).data;
  } catch {
    recent = [];
  }
  if (recent.length === 0) return null;

  return (
    <section className="flex flex-col gap-2 border-t border-[color:var(--line)] pt-10">
      <header className="flex flex-col gap-2">
        <Heading level={2}>{dict.explore.recent.heading}</Heading>
        <Body className="max-w-2xl text-dust">{dict.explore.recent.intro}</Body>
      </header>
      <ul className="flex flex-col">
        {recent.map((media) => (
          <li key={media.id}>
            <ApodListItem media={media} dict={dict} />
          </li>
        ))}
      </ul>
      <Link
        href={`/${locale}/cosmos-today`}
        className="mt-2 font-sans text-sm text-amber underline"
      >
        {dict.explore.recent.cta}
      </Link>
    </section>
  );
}

function RecentShimmer({ dict }: { dict: Dictionary; locale: string }) {
  return (
    <section className="flex flex-col gap-2 border-t border-[color:var(--line)] pt-10">
      <Heading level={2}>{dict.explore.recent.heading}</Heading>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-5 border-t border-[color:var(--line)] py-5">
          <Skeleton className="h-16 w-16 shrink-0" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
      ))}
    </section>
  );
}

// Upcoming close approaches from JPL. Streamed so a slow or unavailable JPL does
// not hold up the rest of the page.
async function NearEarth({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  let objects: Awaited<ReturnType<typeof fetchNearEarth>>["data"] = [];
  try {
    objects = (await fetchNearEarth(6)).data;
  } catch {
    objects = [];
  }
  if (objects.length === 0) return null;

  return (
    <section className="flex flex-col gap-2 border-t border-[color:var(--line)] pt-10">
      <header className="flex flex-col gap-2">
        <Heading level={2}>{dict.explore.nearEarth.heading}</Heading>
        <Body className="max-w-2xl text-dust">{dict.explore.nearEarth.intro}</Body>
      </header>
      <ul className="flex flex-col">
        {objects.map((object) => (
          <NearEarthRow key={object.designation} object={object} dict={dict} locale={locale} />
        ))}
      </ul>
    </section>
  );
}

// Today's Earth from the DSCOVR/EPIC camera. Streamed separately because it needs
// the API key and can be slower.
async function EarthToday({ dict }: { dict: Dictionary }) {
  let images: Awaited<ReturnType<typeof fetchEarthToday>> = [];
  try {
    images = await fetchEarthToday(1);
  } catch {
    images = [];
  }
  const image = images[0];
  if (!image) return null;

  return (
    <section className="flex flex-col gap-3 border-t border-[color:var(--line)] pt-10">
      <header className="flex flex-col gap-2">
        <Heading level={2}>{dict.explore.earthToday.heading}</Heading>
        <Body className="max-w-2xl text-dust">{dict.explore.earthToday.intro}</Body>
      </header>
      <figure className="flex flex-col gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.previewUrl}
          alt={image.altText}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full max-w-sm rounded-full border border-[color:var(--line)] object-cover"
        />
        <figcaption className="font-sans text-xs text-dust">
          {image.credit} · {image.title}
        </figcaption>
      </figure>
      <a
        href={image.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans text-sm text-amber underline"
      >
        {dict.explore.earthToday.cta}
      </a>
    </section>
  );
}

function RowsShimmer({ heading }: { heading: string }) {
  return (
    <section className="flex flex-col gap-2 border-t border-[color:var(--line)] pt-10">
      <Heading level={2}>{heading}</Heading>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 border-t border-[color:var(--line)] py-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
      ))}
    </section>
  );
}
