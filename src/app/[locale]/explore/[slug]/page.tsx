import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TopicDetail } from "@/features/explorer/TopicDetail";
import { categoryName, categorySummary, getCategory } from "@/features/explorer/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const category = getCategory(slug);
  if (!category) return {};
  const dict = await getDictionary(locale);
  const name = categoryName(dict, category);
  return routeMetadata(
    dict.meta,
    { title: `Apeiron: ${name}`, description: categorySummary(dict, category) },
    `explore/${slug}`,
  );
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const category = getCategory(slug);
  if (!category) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <Button href={`/${locale}/explore`} variant="ghost">
          {dict.explore.detail.backToExplore}
        </Button>
        <TopicDetail category={category} dict={dict} locale={locale} />
      </Container>
    </main>
  );
}
