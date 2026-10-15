import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, LOCALES } from "@/i18n/config";
import { fontVariables } from "@/app/fonts";
import "@/app/globals.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  await getDictionary(locale);

  return (
    <html lang={locale} className="bg-void">
      <body className={`${fontVariables} font-sans`}>{children}</body>
    </html>
  );
}
