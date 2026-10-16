"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/en";
import { STAGES } from "./stages";
import { useJourneyProgress } from "./use-journey-progress";
import { JourneyStage } from "./JourneyStage";
import { JourneyProgress } from "./JourneyProgress";
import { ScaleRuler } from "./ScaleRuler";
import { getCalm, subscribeCalm } from "@/lib/motion-preference";
import type { SceneHandle } from "./scene/scene";

// Opacity of a stage panel while scrubbing: fade in, hold, fade out across its
// even share of the scroll. Adjacent stages only ever lightly overlap.
function stageOpacity(progress: number, index: number): number {
  const share = 1 / STAGES.length;
  const t = (progress - index * share) / share;
  if (t < 0 || t > 1) return 0;
  // The hero is the first thing at the top of the page, so it is fully visible
  // before any scroll: no fade-in that would leave scroll-top blank.
  if (index === 0 && t < 0.2) return 1;
  const fade = 0.2;
  if (t < fade) return t / fade;
  if (t > 1 - fade) return (1 - t) / fade;
  return 1;
}

export function CosmicJourney({ dict }: { dict: Dictionary }) {
  // Server and first hydration render the reduced, stacked, no-JS-readable
  // journey (the server snapshot is `true`). We only upgrade to the pinned
  // experience once the client confirms motion is allowed.
  const reduced = useSyncExternalStore(subscribeCalm, getCalm, () => true);

  const { activeIndex, goTo, progress } = useJourneyProgress(reduced);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Lazy-load the canvas scene only in the motion branch. The CSS gradient and
  // star fallback below always renders, so if this import or canvas fails the
  // journey is still visible.
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    (async () => {
      const mod = await import("./scene/scene");
      if (cancelled || !canvasRef.current) return;
      sceneRef.current = mod.createScene(canvasRef.current);
    })();
    return () => {
      cancelled = true;
      sceneRef.current?.destroy();
      sceneRef.current = null;
    };
  }, [reduced]);

  // Animation loop for the motion branch. Reduced mode never runs this, so the
  // scene stays still.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const loop = (now: number) => {
      sceneRef.current?.render(progressRef.current, now / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const sky = (
    <div className="journey-sky pointer-events-none absolute inset-0" aria-hidden="true" />
  );

  if (reduced) {
    // Reduced path: stages stacked in normal flow, no pin, no scrub, no canvas
    // animation. Completable by plain scroll and keyboard.
    return (
      <main className="relative">
        <div className="fixed inset-0 -z-10">
          {sky}
          <div className="absolute inset-0 bg-void/40" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-5xl">
          {STAGES.map((stage) => (
            <JourneyStage
              key={stage.id}
              stage={stage}
              dict={dict}
              className="flex min-h-screen flex-col justify-center px-6 py-24"
            />
          ))}
          <div className="px-6 pb-24">
            <ScaleRuler exponent={STAGES[activeIndex]?.exponent ?? 0} dict={dict} />
          </div>
        </div>
        <JourneyProgress
          activeIndex={activeIndex}
          goTo={goTo}
          dict={dict}
          className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[color:var(--line)] bg-void/70 px-3 py-1.5 backdrop-blur"
        />
      </main>
    );
  }

  // Motion path: one fixed stage viewport pinned by sticky, the tall wrapper
  // below supplies the scroll distance that ScrollTrigger scrubs over.
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
          exponent={STAGES[activeIndex]?.exponent ?? 0}
          dict={dict}
          className="absolute right-8 top-1/2 z-10 hidden w-56 -translate-y-1/2 text-right md:block"
        />
        <div className="absolute inset-0 z-10">
          {STAGES.map((stage, index) => {
            const opacity = stageOpacity(progress, index);
            return (
              <JourneyStage
                key={stage.id}
                stage={stage}
                dict={dict}
                ariaHidden={opacity < 0.05}
                style={{ opacity, pointerEvents: opacity < 0.5 ? "none" : "auto" }}
                className="absolute bottom-[12vh] left-[clamp(20px,6vw,96px)] w-[min(34rem,calc(100%-40px))]"
              />
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
    </div>
  );
}
