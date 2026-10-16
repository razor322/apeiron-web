import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { CosmicJourney } from "@/features/cosmic-journey/CosmicJourney";

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return <CosmicJourney dict={dict} locale={locale} />;
}
