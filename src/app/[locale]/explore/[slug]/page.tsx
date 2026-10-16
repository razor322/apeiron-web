import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TopicDetail } from "@/features/explorer/TopicDetail";
import { getCategory } from "@/features/explorer/categories";

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
