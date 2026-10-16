import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Heading, Body, Label } from "@/components/ui/Typography";
import { PlanetAgeCalculator } from "@/features/calculators/PlanetAgeCalculator";
import { TravelTimeCalculator } from "@/features/calculators/TravelTimeCalculator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = await getDictionary(locale);
  return routeMetadata(meta, meta.calculators, "calculators");
}

export default async function CalculatorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.calculators;

  return (
    <main className="py-16">
      <Container className="flex max-w-3xl flex-col gap-14">
        <div className="flex flex-col gap-3">
          <Heading level={1}>{t.heading}</Heading>
          <Body className="text-dust max-w-2xl">{t.longIntro}</Body>
        </div>

        <section className="flex flex-col gap-4 border-t border-[color:var(--line)] pt-8">
          <PlanetAgeCalculator dict={dict} locale={locale} />
        </section>

        <section className="flex flex-col gap-4 border-t border-[color:var(--line)] pt-8">
          <TravelTimeCalculator dict={dict} locale={locale} />
        </section>

        <div className="border-t border-[color:var(--line)] pt-8">
          <Label>{dict.nav.brand}</Label>
          <div className="mt-4">
            <Button href={`/${locale}`} variant="ghost">
              {t.backHome}
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
