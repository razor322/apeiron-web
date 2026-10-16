import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getText } from "@/features/explorer/categories";
import { getPlanet } from "@/features/explorer/planets";
import { PlanetDetail } from "@/features/explorer/PlanetDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; planet: string }>;
}): Promise<Metadata> {
  const { locale, planet } = await params;
  if (!isLocale(locale)) return {};
  const profile = getPlanet(planet);
  if (!profile) return {};
  const dict = await getDictionary(locale);
  return routeMetadata(
    dict.meta,
    {
      title: `Apeiron: ${getText(dict, profile.nameKey) as string}`,
      description: getText(dict, profile.taglineKey) as string,
    },
    `explore/planet/${planet}`,
  );
}

export default async function PlanetPage({
  params,
}: {
  params: Promise<{ locale: string; planet: string }>;
}) {
  const { locale, planet } = await params;
  if (!isLocale(locale)) notFound();
  const profile = getPlanet(planet);
  if (!profile) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Button href={`/${locale}/explore/planet`} variant="ghost">
          {dict.explore.planet.allPlanets}
        </Button>
        <PlanetDetail planet={profile} dict={dict} locale={locale} />
      </Container>
    </main>
  );
}
