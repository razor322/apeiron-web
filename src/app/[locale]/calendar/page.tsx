import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Heading, Body, Label } from "@/components/ui/Typography";
import { SourceLink } from "@/components/ui/SourceLink";
import { COSMIC_CALENDAR, scaleToYear } from "@/features/content/cosmic-calendar";
import { getText } from "@/features/explorer/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = await getDictionary(locale);
  return routeMetadata(meta, meta.calendar, "calendar");
}

export default async function CalendarPage({
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
          <Heading level={1}>{dict.calendar.heading}</Heading>
          <Body className="max-w-2xl text-dust">{dict.calendar.intro}</Body>
          <Label className="max-w-2xl">{dict.calendar.scaleNote}</Label>
        </header>
        <ol className="flex flex-col">
          {COSMIC_CALENDAR.map((entry) => (
            <li
              key={entry.metricKey}
              className="flex flex-col gap-2 border-b border-[color:var(--line)] py-6 sm:flex-row sm:gap-8"
            >
              <div className="flex min-w-40 flex-col gap-1">
                <span className="font-mono text-xl text-amber">{scaleToYear(entry.realYearsAgo)}</span>
                <Label>{dict.calendar.scaleLabel}</Label>
              </div>
              <div className="flex flex-col gap-2">
                <Heading level={2} className="text-xl">
                  {getText(dict, `${entry.metricKey}.title`) as string}
                </Heading>
                <Body className="max-w-2xl text-dust">
                  {getText(dict, `${entry.metricKey}.text`) as string}
                </Body>
                <SourceLink
                  name={entry.sourceName}
                  url={entry.sourceUrl}
                  label={`${entry.sourceName} (verified ${entry.verifiedAt})`}
                />
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </main>
  );
}
