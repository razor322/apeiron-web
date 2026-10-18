"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { STAGES, readCopy } from "./stages";
import { useJourneyProgress } from "./use-journey-progress";
import { JourneyStage } from "./JourneyStage";
import { CalmJourney } from "./CalmJourney";
import { JourneyProgress } from "./JourneyProgress";
import { JourneySummary } from "./JourneySummary";
import { ScaleRuler } from "./ScaleRuler";
import { ScaleReadout } from "./ScaleReadout";
import { getCalm, subscribeCalm } from "@/lib/motion-preference";
import { useTrackStage } from "@/lib/journey-progress";
import type { SceneHandle } from "./scene/scene";

// Opacity of a stage panel while scrubbing, keyed to the stage's own scroll
// window so text and camera describe the same moment. Fades in, holds, fades out.
function stageOpacity(progress: number, index: number): number {
  const [start, end] = STAGES[index]!.range;
  const span = Math.max(0.0001, end - start);
  const t = (progress - start) / span;
  if (t < 0 || t > 1) return 0;
  // The hero is the first thing at the top of the page: fully visible before any
  // scroll, so scroll-top is never blank.
  if (index === 0 && t < 0.2) return 1;
  const fade = 0.25;
  if (t < fade) return t / fade;
  if (t > 1 - fade) return (1 - t) / fade;
  return 1;
}

export function CosmicJourney({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  // Server and first hydration render the reduced, stacked, no-JS-readable
  // journey (the server snapshot is `true`). We only upgrade to the pinned
  // experience once the client confirms motion is allowed.
  const reduced = useSyncExternalStore(subscribeCalm, getCalm, () => true);

  const { activeIndex, goTo, progressRef } = useJourneyProgress(reduced);

  useTrackStage(STAGES[activeIndex]?.id ?? STAGES[0]!.id);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  // One wrapper per stage, so the scroll loop can set opacity/pointer-events on
  // the DOM directly instead of re-rendering React every frame.
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Lazy-load the canvas scene only in the motion branch. The CSS gradient and
  // star fallback below always renders, so if this import or canvas fails the
  // journey is still visible.
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const starLabels: Record<string, string> = {
      "journey.stars.proxima": readCopy(dict, "journey.stars.proxima"),
      "journey.stars.alphaCentauri": readCopy(dict, "journey.stars.alphaCentauri"),
      "journey.stars.sirius": readCopy(dict, "journey.stars.sirius"),
      "journey.stars.barnard": readCopy(dict, "journey.stars.barnard"),
      "journey.stars.others": readCopy(dict, "journey.stars.others"),
    };
    (async () => {
      const mod = await import("./scene/scene");
      if (cancelled || !canvasRef.current) return;
      sceneRef.current = mod.createScene(canvasRef.current, { stars: starLabels });
    })();
    return () => {
      cancelled = true;
      sceneRef.current?.destroy();
      sceneRef.current = null;
    };
  }, [reduced, dict]);

  // Animation loop for the motion branch. Reduced mode never runs this, so the
  // scene stays still. Besides rendering the canvas, it writes each panel's
  // opacity straight to the DOM from the progress ref, so scrolling does not
  // re-render the tree.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const loop = (now: number) => {
      const p = progressRef.current;
      sceneRef.current?.render(p, now / 1000);
      for (let i = 0; i < STAGES.length; i++) {
        const el = panelRefs.current[i];
        if (!el) continue;
        const opacity = stageOpacity(p, i);
        el.style.opacity = String(opacity);
        el.style.pointerEvents = opacity < 0.5 ? "none" : "auto";
        if (opacity < 0.05) el.setAttribute("aria-hidden", "true");
        else el.removeAttribute("aria-hidden");
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, progressRef]);

  const sky = (
    <div className="journey-sky pointer-events-none absolute inset-0" aria-hidden="true" />
  );

  if (reduced) {
    // Reduced path: a plain card per stage with a real image, no pin, no scrub,
    // no canvas animation. Completable by plain scroll and keyboard.
    return <CalmJourney dict={dict} activeIndex={activeIndex} goTo={goTo} sky={sky} />;
  }

  // Motion path: one fixed stage viewport pinned by sticky, the tall wrapper
  // below supplies the scroll distance that ScrollTrigger scrubs over. Content
  // panels sit fixed bottom-left, the hero and mid transition centre themselves,
  // the ruler and readout live on the right, as in the prototype.
  return (
    <div className="relative" style={{ height: `${STAGES.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {sky}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[52vh]"
          style={{
            background:
              "linear-gradient(to top, rgba(5,6,10,0.9), rgba(5,6,10,0.55) 45%, rgba(5,6,10,0))",
          }}
        />
        <ScaleRuler
          progressRef={progressRef}
          exponent={STAGES[activeIndex]?.exponent ?? 0}
          dict={dict}
          className="absolute right-[clamp(18px,2.4vw,30px)] top-1/2 z-10 hidden w-44 -translate-y-1/2 text-right md:block"
        />
        <ScaleReadout
          progressRef={progressRef}
          locale={locale}
          dict={dict}
          className="absolute right-[clamp(18px,3vw,36px)] bottom-[clamp(40px,11vh,110px)] z-10 hidden text-right md:block"
        />
        <div className="absolute inset-0 z-10">
          {STAGES.map((stage, index) => {
            const kind = stage.kind;
            const position =
              kind === "hero" || kind === "mid"
                ? "absolute inset-x-0 top-[19vh] px-5"
                : "absolute bottom-[clamp(40px,11vh,110px)] left-[clamp(20px,6vw,96px)] w-[min(34rem,calc(100%-40px))]";
            return (
              <div
                key={stage.id}
                ref={(el) => {
                  panelRefs.current[index] = el;
                }}
                style={{ opacity: 0, pointerEvents: "none" }}
                className={position}
              >
                <JourneyStage stage={stage} dict={dict} />
              </div>
            );
          })}
        </div>
        <JourneyProgress
          activeIndex={activeIndex}
          goTo={goTo}
          dict={dict}
          className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[color:var(--line)] bg-void/70 px-3 py-1.5 backdrop-blur"
        />
      </div>
      <section className="relative z-10 mx-auto w-full max-w-3xl px-6 py-[16vh]">
        <JourneySummary dict={dict} />
      </section>
    </div>
  );
}
