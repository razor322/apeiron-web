import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen flex flex-col items-start justify-center gap-6 px-6">
      <h1 className="font-serif text-4xl text-starlight">{dict.nav.home}</h1>
    </main>
  );
}
