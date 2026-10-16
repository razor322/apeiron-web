import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Heading, Body } from "@/components/ui/Typography";
import { NumbersStrip } from "@/features/content/NumbersStrip";
import { COSMIC_FACTS } from "@/features/cosmic-facts/facts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = await getDictionary(locale);
  return routeMetadata(meta, meta.numbers, "numbers");
}

export default async function NumbersPage({
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
          <Heading level={1}>{dict.numbers.heading}</Heading>
          <Body className="max-w-2xl text-dust">{dict.numbers.intro}</Body>
        </header>
        <NumbersStrip facts={COSMIC_FACTS} dict={dict} />
      </Container>
    </main>
  );
}
