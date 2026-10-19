import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { CATEGORIES, getText } from "@/features/explorer/categories";
import { readCopy } from "./stages";

// The widest view doubles as the most navigable: every Explore category as a
// link, so the Observable Universe stage leads somewhere.
export function CosmosGrid({
  locale,
  dict,
  className = "",
}: {
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-sans text-sm uppercase tracking-wide text-dust">
        {readCopy(dict, "journey.cosmos.heading")}
      </h3>
      <p className="mt-1 mb-4 max-w-[34rem] font-sans text-sm text-dust">
        {readCopy(dict, "journey.cosmos.intro")}
      </p>
      <ul className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/${locale}/explore/${c.slug}`}
              className="block rounded-full border border-[color:var(--line)] px-3 py-1 font-sans text-xs text-dust transition-colors hover:border-amber hover:text-amber"
            >
              {String(getText(dict, c.nameKey) ?? c.slug)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
