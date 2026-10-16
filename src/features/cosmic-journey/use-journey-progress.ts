"use client";

import { useCallback, useEffect, useState } from "react";
import { STAGES, activeStageIndex } from "./stages";

function readProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

type JourneyProgress = {
  activeIndex: number;
  goTo: (index: number) => void;
  progress: number;
};

// Scroll-driven journey position. In the non-reduced branch GSAP ScrollTrigger
// is registered here and scrubs progress; in the reduced branch a plain passive
// scroll listener does, so no pinning or scrubbing code runs.
export function useJourneyProgress(reduced: boolean): JourneyProgress {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced) {
      const onScroll = () => setProgress(readProgress());
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const state = { p: 0 };
      const tween = gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: () => setProgress(state.p),
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onRefresh: (self) => {
            state.p = self.progress;
            setProgress(self.progress);
          },
        },
      });
      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reduced]);

  const goTo = useCallback(
    (index: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = ((index + 0.5) / STAGES.length) * Math.max(0, max);
      window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  return { activeIndex: activeStageIndex(progress), goTo, progress };
}
