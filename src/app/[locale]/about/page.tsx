import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Heading, Body, Label } from "@/components/ui/Typography";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = await getDictionary(locale);
  return routeMetadata(meta, meta.about, "about");
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.about;

  return (
    <main className="py-16">
      <Container className="flex max-w-3xl flex-col gap-14">
        <Heading level={1}>{t.heading}</Heading>

        <section className="flex flex-col gap-3 border-t border-[color:var(--line)] pt-8">
          <Heading level={2}>{t.purposeHeading}</Heading>
          <Body className="text-dust">{t.purpose}</Body>
        </section>

        <section className="flex flex-col gap-4 border-t border-[color:var(--line)] pt-8">
          <Heading level={2}>{t.sourcesHeading}</Heading>
          <Body className="text-dust">{t.sourcesIntro}</Body>
          <table className="w-full border-collapse text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-[color:var(--line)] text-dust">
                <th className="py-3 pr-4 font-normal">{t.sourceTable.source}</th>
                <th className="py-3 pr-4 font-normal">{t.sourceTable.usedFor}</th>
                <th className="py-3 font-normal">{t.sourceTable.licence}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--line)] align-top">
                <td className="py-3 pr-4">
                  <a
                    href={t.sourceTable.apodUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber underline"
                  >
                    NASA APOD
                  </a>
                </td>
                <td className="py-3 pr-4 text-starlight">{t.sourceTable.apodUse}</td>
                <td className="py-3 text-dust">{t.sourceTable.apodLicence}</td>
              </tr>
              <tr className="border-b border-[color:var(--line)] align-top">
                <td className="py-3 pr-4">
                  <a
                    href={t.sourceTable.nasaImagesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber underline"
                  >
                    NASA Image and Video Library
                  </a>
                </td>
                <td className="py-3 pr-4 text-starlight">{t.sourceTable.nasaImagesUse}</td>
                <td className="py-3 text-dust">{t.sourceTable.nasaImagesLicence}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="flex flex-col gap-3 border-t border-[color:var(--line)] pt-8">
          <Heading level={2}>{t.methodologyHeading}</Heading>
          <Body className="text-starlight">{t.methodology}</Body>
        </section>

        <section className="flex flex-col gap-3 border-t border-[color:var(--line)] pt-8">
          <Heading level={2}>{t.rightsHeading}</Heading>
          <Body className="text-dust">{t.rights}</Body>
        </section>

        <section className="flex flex-col gap-3 border-t border-[color:var(--line)] pt-8">
          <Heading level={2}>{t.limitationsHeading}</Heading>
          <Body className="text-dust">{t.limitations}</Body>
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
