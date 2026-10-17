import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { fetchApodList } from "@/lib/astronomy/providers/nasa-apod";
import type { AstronomyMedia, AstronomySnapshot } from "@/lib/astronomy/models";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Typography";
import { ApodCard } from "@/features/cosmos-today/ApodCard";
import { ApodListItem } from "@/features/cosmos-today/ApodListItem";
import { ApodFallback } from "@/features/cosmos-today/ApodFallback";

// APOD updates daily; regenerate every 6h to match the adapter cache TTL instead
// of freezing today's image at build time.
export const revalidate = 21600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = await getDictionary(locale);
  return routeMetadata(meta, meta.cosmosToday, "cosmos-today");
}

export default async function CosmosTodayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  let snapshot: AstronomySnapshot<AstronomyMedia[]> | null = null;
  try {
    snapshot = await fetchApodList(12);
  } catch {
    snapshot = null;
  }

  const [today, ...recent] = snapshot?.data ?? [];

  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Heading level={1}>{dict.cosmosToday.heading}</Heading>
        {today ? (
          <>
            <ApodCard
              snapshot={{
                data: today,
                provider: snapshot!.provider,
                sourceUrl: snapshot!.sourceUrl,
                retrievedAt: snapshot!.retrievedAt,
                stale: snapshot!.stale,
              }}
              dict={dict}
            />
            {recent.length > 0 ? (
              <section className="flex flex-col gap-2">
                <Heading level={2} className="text-xl">
                  {dict.cosmosToday.recentHeading}
                </Heading>
                <ul className="flex flex-col">
                  {recent.map((media) => (
                    <li key={media.id}>
                      <ApodListItem media={media} dict={dict} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : (
          <ApodFallback dict={dict} />
        )}
      </Container>
    </main>
  );
}
