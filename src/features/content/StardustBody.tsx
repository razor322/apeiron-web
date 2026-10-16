import type { Dictionary } from "@/i18n/en";
import { Heading, Body } from "@/components/ui/Typography";
import { SourceLink } from "@/components/ui/SourceLink";

export function StardustBody({ dict }: { dict: Dictionary }) {
  return (
    <article className="flex flex-col gap-6">
      <Heading level={1}>{dict.stardust.heading}</Heading>
      <Body className="max-w-2xl text-dust">{dict.stardust.intro}</Body>
      <Body className="max-w-2xl text-dust">{dict.stardust.body}</Body>
      <blockquote className="flex max-w-2xl flex-col gap-3 border-l border-[color:var(--line)] pl-6">
        <Body className="text-starlight">{dict.stardust.claim}</Body>
        <SourceLink
          name={dict.stardust.claimSource}
          url={dict.stardust.claimUrl}
          label={`${dict.stardust.claimSource} (verified ${dict.stardust.claimVerifiedAt})`}
        />
      </blockquote>
    </article>
  );
}
