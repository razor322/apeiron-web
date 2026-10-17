"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import { getFact } from "@/features/cosmic-facts/facts";
import { categoryName, categorySummary, type Category } from "@/features/explorer/categories";
import { getCategoryImage } from "@/features/explorer/category-images";
import { ImageCredit } from "@/components/ui/ImageCredit";

type TopicCardProps = {
  category: Category;
  dict: Dictionary;
  locale?: string;
};

export function TopicCard({ category, dict, locale = "en" }: TopicCardProps) {
  const fact = category.factId ? getFact(category.factId) : undefined;
  const image = getCategoryImage(category.slug);
  const [failed, setFailed] = useState(false);
  const href = `/${locale}/explore/${category.slug}`;

  return (
    <div className="flex flex-col gap-3 border-t border-[color:var(--line)] pt-5">
      <Link href={href} className="group flex flex-col gap-3">
        {image && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.previewUrl}
            alt={image.altText}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="aspect-[4/3] w-full rounded-sm border border-[color:var(--line)] object-cover transition-colors group-hover:border-amber"
          />
        ) : (
          <span
            aria-hidden
            className="aspect-[4/3] w-full rounded-sm border border-[color:var(--line)] bg-[radial-gradient(circle_at_35%_30%,rgba(232,161,91,0.28),transparent_60%)] transition-colors group-hover:border-amber"
          />
        )}
        <span className="font-sans text-base text-starlight group-hover:text-amber">
          {categoryName(dict, category)}
        </span>
        {fact ? (
          <span className="font-mono text-xs text-dust">
            {fact.displayValue}
            {fact.unit ? ` ${fact.unit}` : ""}
          </span>
        ) : (
          <span className="font-sans text-sm text-dust">{categorySummary(dict, category)}</span>
        )}
      </Link>
      {image && !failed ? (
        <ImageCredit credit={image.credit} sourceUrl={image.sourceUrl} link={false} />
      ) : null}
    </div>
  );
}
