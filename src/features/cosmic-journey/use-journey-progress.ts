"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { STAGES, activeStageIndex } from "./stages";

function readProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

type JourneyProgress = {
  activeIndex: number;
  goTo: (index: number) => void;
  // Live scroll progress for the current frame. Held in a ref, not React state,
  // so scrubbing does not re-render the tree 60 times a second; consumers read
  // it inside their own rAF loop and write to the DOM directly.
  progressRef: MutableRefObject<number>;
};

// Scroll-driven journey position. In the non-reduced branch GSAP ScrollTrigger
// is registered here and scrubs progress; in the reduced branch a plain passive
// scroll listener does, so no pinning or scrubbing code runs. Only the coarse
// active stage drives React state (it changes a handful of times per page, not
// every frame).
export function useJourneyProgress(reduced: boolean): JourneyProgress {
  const progressRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef(0);

  useEffect(() => {
    const setActive = (index: number) => {
      if (index !== activeRef.current) {
        activeRef.current = index;
        setActiveIndex(index);
      }
    };

    if (reduced) {
      const onScroll = () => {
        const p = readProgress();
        progressRef.current = p;
        setActive(activeStageIndex(p));
      };
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
      const apply = (p: number) => {
        progressRef.current = p;
        setActive(activeStageIndex(p));
      };
      const tween = gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: () => apply(state.p),
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onRefresh: (self) => {
            state.p = self.progress;
            apply(self.progress);
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
      // Reflect the keyboard choice immediately so the progress nav is correct
      // even before ScrollTrigger has attached or the smooth scroll settles.
      activeRef.current = index;
      setActiveIndex(index);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = ((index + 0.5) / STAGES.length) * Math.max(0, max);
      window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  return { activeIndex, goTo, progressRef };
}
