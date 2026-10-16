import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Heading, Body } from "@/components/ui/Typography";
import { CategoryGrid } from "@/features/explorer/CategoryGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = await getDictionary(locale);
  return routeMetadata(meta, meta.explore, "explore");
}

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
        <section className="flex flex-col gap-6 border-t border-[color:var(--line)] pt-10">
          <header className="flex flex-col gap-2">
            <Heading level={2}>{dict.explore.more.heading}</Heading>
            <Body className="max-w-2xl text-dust">{dict.explore.more.intro}</Body>
          </header>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-3">
            {[
              { href: "numbers", ...dict.explore.more.numbers },
              { href: "calendar", ...dict.explore.more.calendar },
              { href: "stardust", ...dict.explore.more.stardust },
            ].map((item) => (
              <li key={item.href}>
                <a
                  href={`/${locale}/${item.href}`}
                  className="flex flex-col gap-2 border border-[color:var(--line)] p-6 transition-colors hover:border-amber"
                >
                  <span className="font-serif text-xl text-starlight">{item.title}</span>
                  <span className="font-sans text-sm text-dust">{item.summary}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </main>
  );
}
