import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { fetchApod } from "@/lib/astronomy/providers/nasa-apod";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Typography";
import { ApodCard } from "@/features/cosmos-today/ApodCard";
import { ApodFallback } from "@/features/cosmos-today/ApodFallback";

export default async function CosmosTodayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  let snapshot;
  try {
    snapshot = await fetchApod();
  } catch {
    snapshot = null;
  }

  return (
    <main className="py-16">
      <Container className="flex flex-col gap-8">
        <Heading level={1}>{dict.cosmosToday.heading}</Heading>
        {snapshot ? (
          <ApodCard snapshot={snapshot} dict={dict} />
        ) : (
          <ApodFallback dict={dict} />
        )}
      </Container>
    </main>
  );
}
