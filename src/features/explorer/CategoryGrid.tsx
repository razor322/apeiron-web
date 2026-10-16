import type { Dictionary } from "@/i18n/en";
import { CATEGORIES } from "@/features/explorer/categories";
import { TopicCard } from "@/features/explorer/TopicCard";

export function CategoryGrid({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: string;
}) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {CATEGORIES.map((category) => (
        <li key={category.slug}>
          <TopicCard category={category} dict={dict} locale={locale} />
        </li>
      ))}
    </ul>
  );
}
