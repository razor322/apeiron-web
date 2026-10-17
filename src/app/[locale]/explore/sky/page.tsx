import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { fetchNearEarth } from "@/lib/astronomy/providers/near-earth";
import { fetchEarthToday } from "@/lib/astronomy/providers/epic";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Heading, Body } from "@/components/ui/Typography";
import { Skeleton } from "@/components/ui/Skeleton";
import { NearEarthRow } from "@/features/explorer/NearEarthRow";

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
    { title: `Apeiron: ${dict.explore.sky.heading}`, description: dict.explore.sky.intro },
    "explore/sky",
  );
}

export default async function SkyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Button href={`/${locale}/explore`} variant="ghost">
          {dict.explore.planet.backToExplore}
        </Button>
        <header className="flex flex-col gap-3">
          <Heading level={1}>{dict.explore.sky.heading}</Heading>
          <Body className="max-w-2xl text-dust">{dict.explore.sky.intro}</Body>
        </header>
        <Suspense fallback={<RowsShimmer heading={dict.explore.nearEarth.heading} />}>
          <NearEarth dict={dict} locale={locale} />
        </Suspense>
        <Suspense fallback={<RowsShimmer heading={dict.explore.earthToday.heading} />}>
          <EarthToday dict={dict} />
        </Suspense>
      </Container>
    </main>
  );
}

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
