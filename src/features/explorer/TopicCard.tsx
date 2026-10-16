import type { Dictionary } from "@/i18n/en";
import { getFact } from "@/features/cosmic-facts/facts";
import { categoryName, categorySummary, type Category } from "@/features/explorer/categories";

type TopicCardProps = {
  category: Category;
  dict: Dictionary;
  locale?: string;
};

export function TopicCard({ category, dict, locale = "en" }: TopicCardProps) {
  const fact = category.factId ? getFact(category.factId) : undefined;
  const href = `/${locale}/explore/${category.slug}`;

  return (
    <a
      href={href}
      className="group flex flex-col gap-4 border-t border-[color:var(--line)] pt-5 transition-colors"
    >
      {/* CSS-generated specimen motif (no fabricated astronomy photo, R-22/R-38). */}
      <span
        aria-hidden
        className="h-16 w-16 rounded-full border border-[color:var(--line)] bg-[radial-gradient(circle_at_35%_30%,rgba(232,161,91,0.28),transparent_60%)] transition-colors group-hover:border-amber"
      />
      <span className="font-sans text-base text-starlight group-hover:text-amber">
        {categoryName(dict, category)}
      </span>
      {/* Weight varies by content: only categories with a curated fact earn a teaser. */}
      {fact ? (
        <span className="font-mono text-xs text-dust">
          {fact.displayValue}
          {fact.unit ? ` ${fact.unit}` : ""}
        </span>
      ) : (
        <span className="font-sans text-sm text-dust">{categorySummary(dict, category)}</span>
      )}
    </a>
  );
}
