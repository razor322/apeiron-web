"use client";

import { useEffect } from "react";
import { onCLS, onINP, onLCP } from "web-vitals";

type MetricLike = { name: string; value: number };

function report(metric: MetricLike): void {
  console.info(`[web-vitals] name=${metric.name} value=${metric.value}`);
}

// Registers CLS/LCP/INP once on mount and logs each to the console. Renders
// nothing: measurements are client-only and invisible to the DOM.
export function WebVitalsReporter() {
  useEffect(() => {
    onCLS(report);
    onLCP(report);
    onINP(report);
  }, []);

  return null;
}
