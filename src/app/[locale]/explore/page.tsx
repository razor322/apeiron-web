import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { Container } from "@/components/ui/Container";
import { Heading, Body } from "@/components/ui/Typography";
import { CategoryGrid } from "@/features/explorer/CategoryGrid";

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
      </Container>
    </main>
  );
}
