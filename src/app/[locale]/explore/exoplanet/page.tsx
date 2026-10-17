import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { fetchExoplanetCount, fetchRecentExoplanets } from "@/lib/astronomy/providers/exoplanet";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Typography";
import { ExoplanetIntro, ExoplanetRowCard } from "@/features/explorer/ExoplanetContent";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  const t = dict.explore.exoplanetPage;
  return routeMetadata(
    dict.meta,
    { title: `Apeiron: ${t.heading}`, description: t.intro },
    "explore/exoplanet",
  );
}

export default async function ExoplanetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  let count = 0;
  let recent: Awaited<ReturnType<typeof fetchRecentExoplanets>>["data"] = [];
  try {
    [count, recent] = await Promise.all([
      fetchExoplanetCount(),
      fetchRecentExoplanets(12).then((s) => s.data),
    ]);
  } catch {
    // Both derive from the same archive; if it is unreachable, show the shell.
  }

  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Button href={`/${locale}/explore`} variant="ghost">
          {dict.explore.planet.backToExplore}
        </Button>
        <ExoplanetIntro count={count} dict={dict} locale={locale} />
        {recent.length > 0 ? (
          <section className="flex flex-col gap-2">
            <Heading level={2} className="text-xl">
              {dict.explore.exoplanetPage.recentHeading}
            </Heading>
            <ul className="flex flex-col">
              {recent.map((planet) => (
                <ExoplanetRowCard key={planet.pl_name} planet={planet} dict={dict} />
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
