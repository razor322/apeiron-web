"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/en";
import { STAGES, readCopy, type JourneyStageDef } from "./stages";
import { getJourneyImage } from "./journey-images";
import { JourneyStage } from "./JourneyStage";
import { JourneyProgressBar } from "./JourneyProgressBar";
import { ScaleRuler } from "./ScaleRuler";

// The calm (reduced-motion) journey: a plain, single-column set of cards, one per
// stage, each with a real image so the story reads clearly with no animation and
// no canvas. Completable by ordinary scroll and keyboard.
export function CalmJourney({
  dict,
  activeIndex,
  sky,
}: {
  dict: Dictionary;
  activeIndex: number;
  sky: React.ReactNode;
}) {
  return (
    <main className="relative">
      <div className="fixed inset-0 -z-10">
        {sky}
        <div className="absolute inset-0 bg-void/40" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-3xl px-6">
        {STAGES.map((stage) => (
          <CalmStage key={stage.id} stage={stage} dict={dict} />
        ))}
        <div className="pb-28 pt-8">
          <ScaleRuler
            exponent={STAGES[activeIndex]?.exponent ?? 0}
            activeStageId={STAGES[activeIndex]?.id}
            dict={dict}
          />
        </div>
      </div>
      <JourneyProgressBar
        activeIndex={activeIndex}
        dict={dict}
        className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[color:var(--line)] bg-void/70 px-4 py-2 backdrop-blur"
      />
    </main>
  );
}

function CalmStage({ stage, dict }: { stage: JourneyStageDef; dict: Dictionary }) {
  const image = getJourneyImage(stage.id);
  const [failed, setFailed] = useState(false);
  const showImage = image && !failed;

  return (
    <section
      id={`stage-${stage.id}`}
      aria-label={readCopy(dict, stage.ariaLabel)}
      className="flex flex-col gap-6 border-t border-[color:var(--line)] py-16 first:border-t-0"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image!.previewUrl}
          alt={image!.altText}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="aspect-[16/9] w-full rounded-sm border border-[color:var(--line)] object-cover"
        />
      ) : null}
      <JourneyStage stage={stage} dict={dict} />
      {showImage ? (
        <p className="font-sans text-xs text-dust">
          {image!.credit}{" "}
          <a
            href={image!.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber underline"
          >
            NASA
          </a>
        </p>
      ) : null}
    </section>
  );
}
