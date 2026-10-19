import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import type { JourneyObject } from "./journey-objects";
import { readCopy } from "./stages";

// A small card that follows the pointer over a drawn object: its name, its
// image, and a link. Decorative in that the canvas is aria-hidden, so this is a
// bonus path; the DOM rows remain the accessible route to the same objects.
export function ObjectHoverCard({
  object,
  x,
  y,
  locale,
  dict,
}: {
  object: JourneyObject | undefined;
  x: number;
  y: number;
  locale: Locale;
  dict: Dictionary;
}) {
  if (!object) return null;
  const name = readCopy(dict, object.nameKey);
  const image = object.image;
  const src = image?.previewUrl ?? image?.originalUrl;
  return (
    <div
      className="pointer-events-none absolute z-30 w-44 -translate-x-1/2 rounded-sm border border-[color:var(--line)] bg-void/90 p-2 backdrop-blur"
      style={{ left: x, top: y - 12 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={image!.altText}
          loading="lazy"
          decoding="async"
          className="mb-2 aspect-square w-full rounded-sm object-cover"
        />
      ) : null}
      <p className="font-sans text-xs text-starlight">{name}</p>
      <Link
        href={`/${locale}/explore/${object.href}`}
        className="pointer-events-auto font-sans text-[11px] text-amber underline"
      >
        {readCopy(dict, "journey.objects.cardHint")}
      </Link>
    </div>
  );
}
