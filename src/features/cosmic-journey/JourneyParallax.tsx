"use client";

import { useEffect, useRef } from "react";
import { getReducedMotion } from "@/lib/motion-preference";

// A gentle scroll-linked shift on its children, so the calm journey's images
// move a little more slowly than the page. Off entirely when the OS asks for
// reduced motion, and off before hydration, so it never fights accessibility.
export function JourneyParallax({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || getReducedMotion()) return;
    let raf = 0;
    const tick = () => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const shift = Math.max(-18, Math.min(18, -center * 0.04));
      el.style.transform = `translateY(${shift}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
