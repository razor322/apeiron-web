import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Heading, Body } from "@/components/ui/Typography";
import { SolarSystem3D } from "@/features/solar-system-3d/SolarSystem3D";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta, solarSystem3d } = await getDictionary(locale);
  return routeMetadata(
    meta,
    { title: solarSystem3d.metaTitle, description: solarSystem3d.metaDescription },
    "solar-system-3d",
  );
}

export default async function SolarSystem3DPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.solarSystem3d;

  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <Heading level={1}>{t.heading}</Heading>
          <Body className="max-w-2xl text-dust">{t.intro}</Body>
        </header>
        <SolarSystem3D locale={locale} dict={dict} />
      </Container>
    </main>
  );
}
