import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Heading, Body } from "@/components/ui/Typography";
import { PLANETS } from "@/features/explorer/planets";
import { PlanetCard } from "@/features/explorer/PlanetCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta, explore } = await getDictionary(locale);
  return routeMetadata(
    meta,
    { title: `Apeiron: ${explore.planet.heading}`, description: explore.planet.intro },
    "explore/planet",
  );
}

export default async function PlanetIndexPage({
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
        <Button href={`/${locale}/explore`} variant="ghost">
          {dict.explore.planet.backToExplore}
        </Button>
        <header className="flex flex-col gap-3">
          <Heading level={1}>{dict.explore.planet.heading}</Heading>
          <Body className="max-w-2xl text-dust">{dict.explore.planet.intro}</Body>
        </header>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PLANETS.map((planet) => (
            <li key={planet.slug}>
              <PlanetCard planet={planet} dict={dict} locale={locale} />
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
