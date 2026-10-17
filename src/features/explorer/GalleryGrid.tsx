import type { AstronomyMedia } from "@/lib/astronomy/models";
import { ImageCredit } from "@/components/ui/ImageCredit";

// A grid of NASA Image Library results for one curated query. Each image carries
// its own credit and source link.
export function GalleryGrid({ title, media }: { title: string; media: AstronomyMedia[] }) {
  if (media.length === 0) return null;
  return (
    <section className="flex flex-col gap-4 border-t border-[color:var(--line)] pt-10">
      <h2 className="font-serif text-2xl text-starlight">{title}</h2>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((item) => (
          <li key={item.id} className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={item.altText}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-sm border border-[color:var(--line)] object-cover"
            />
            <span className="font-sans text-sm text-starlight">{item.title}</span>
            <ImageCredit credit={item.credit} sourceUrl={item.sourceUrl} />
          </li>
        ))}
      </ul>
    </section>
  );
}
