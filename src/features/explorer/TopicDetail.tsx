import type { Dictionary } from "@/i18n/en";
import { getFact } from "@/features/cosmic-facts/facts";
import { CATEGORIES, categoryName, categorySummary, getText, type Category } from "@/features/explorer/categories";
import { DataLabel } from "@/components/ui/DataLabel";
import { SourceLink } from "@/components/ui/SourceLink";
import { Heading, Body, Label } from "@/components/ui/Typography";

export function TopicDetail({
  category,
  dict,
  locale,
}: {
  category: Category;
  dict: Dictionary;
  locale: string;
}) {
  const fact = category.factId ? getFact(category.factId) : undefined;
  const terms = (getText(dict, `explore.terms.${category.slug}`) as string[]) ?? [];

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-3 border-b border-[color:var(--line)] pb-6">
        <Label>{dict.explore.detail.definition}</Label>
        <Heading level={1}>{categoryName(dict, category)}</Heading>
        <Body>{categorySummary(dict, category)}</Body>
      </header>

      {fact ? (
        <section className="flex flex-col gap-3">
          <Heading level={2} className="text-xl">
            {dict.explore.detail.facts}
          </Heading>
          <DataLabel
            value={fact.displayValue}
            unit={fact.unit}
            label={fact.title}
            confidenceType={fact.confidenceType}
            dict={dict}
          />
          <SourceLink name={fact.sourceName} url={fact.sourceUrl} label={fact.sourceName} />
        </section>
      ) : null}

      {terms.length > 0 ? (
        <section className="flex flex-col gap-2">
          <Heading level={2} className="text-xl">
            {dict.explore.detail.terms}
          </Heading>
          <ul className="flex flex-col gap-1">
            {terms.map((term) => (
              <li key={term} className="font-sans text-sm text-dust">
                {term}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <Heading level={2} className="text-xl">
          {dict.explore.detail.related}
        </Heading>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {CATEGORIES.filter((c) => c.slug !== category.slug)
            .slice(0, 3)
            .map((c) => (
              <li key={c.slug}>
                <a
                  href={`/${locale}/explore/${c.slug}`}
                  className="font-sans text-sm text-starlight underline decoration-[color:var(--line)] hover:text-amber"
                >
                  {categoryName(dict, c)}
                </a>
              </li>
            ))}
        </ul>
      </section>
    </article>
  );
}
