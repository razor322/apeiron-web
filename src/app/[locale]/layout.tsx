import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, LOCALES } from "@/i18n/config";
import { metadataBase } from "@/lib/seo";
import { Navbar } from "@/components/ui/Navbar";
import { MotionToggle } from "@/components/ui/MotionToggle";

export const metadata: Metadata = {
  metadataBase: metadataBase(),
};

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
  const dict = await getDictionary(locale);

  return (
    <>
      <Navbar locale={locale} dict={dict}>
        <MotionToggle dict={dict} />
      </Navbar>
      {children}
    </>
  );
}
