import type { AstronomyMedia, AstronomySnapshot } from "@/lib/astronomy/models";
import type { Dictionary } from "@/i18n/en";
import { Heading, Label } from "@/components/ui/Typography";
import { ImageCredit } from "@/components/ui/ImageCredit";

type ApodCardProps = {
  snapshot: AstronomySnapshot<AstronomyMedia>;
  dict: Dictionary;
};

export function ApodCard({ snapshot, dict }: ApodCardProps) {
  const { data } = snapshot;
  const retrieved = new Date(snapshot.retrievedAt).toISOString().slice(0, 10);

  return (
    <article className="flex flex-col gap-5">
      {data.mediaType === "image" && data.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.previewUrl}
          alt={data.altText}
          className="w-full rounded-sm"
        />
      ) : (
        <a
          href={data.originalUrl ?? data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans text-sm text-amber underline"
        >
          {dict.cosmosToday.openMedia}
        </a>
      )}

      <Heading level={2}>{data.title}</Heading>

      {data.explanation ? (
        <p className="max-w-prose font-sans text-base leading-relaxed text-starlight">
          {data.explanation}
        </p>
      ) : null}

      <Label>
        {dict.cosmosToday.retrievedOn} {retrieved}
      </Label>

      <ImageCredit credit={data.credit} sourceUrl={data.sourceUrl} />

      {snapshot.stale ? (
        <p className="font-sans text-sm text-dust">
          {dict.common.staleNotice} {retrieved}
        </p>
      ) : null}
    </article>
  );
}
