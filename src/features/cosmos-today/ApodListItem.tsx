import type { AstronomyMedia } from "@/lib/astronomy/models";
import type { Dictionary } from "@/i18n/en";

// One row in the "recent" list under today's image: a small thumbnail when the
// entry is an image, a date, and the title, linking to the APOD article.
export function ApodListItem({ media, dict }: { media: AstronomyMedia; dict: Dictionary }) {
  const date = media.publishedAt ?? media.retrievedAt.slice(0, 10);
  return (
    <a
      href={media.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-5 border-t border-[color:var(--line)] py-5 transition-colors"
    >
      {media.mediaType === "image" && media.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.previewUrl}
          alt={media.altText}
          loading="lazy"
          className="h-16 w-16 shrink-0 rounded-sm border border-[color:var(--line)] object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border border-[color:var(--line)] bg-[radial-gradient(circle_at_35%_30%,rgba(232,161,91,0.28),transparent_60%)] font-sans text-xs text-dust"
        >
          {dict.cosmosToday.videoLabel}
        </span>
      )}
      <span className="flex flex-col gap-1">
        <span className="font-mono text-xs text-dust">{date}</span>
        <span className="font-serif text-lg leading-tight text-starlight group-hover:text-amber">
          {media.title}
        </span>
      </span>
    </a>
  );
}
