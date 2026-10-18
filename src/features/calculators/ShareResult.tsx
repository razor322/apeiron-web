"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/en";

// Copies the current URL (which carries the inputs) to the clipboard. Failure
// is reported, never silent: the button says so instead of pretending.
export function ShareResult({ dict }: { dict: Dictionary }) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const label =
    state === "done"
      ? dict.calculators.share.copied
      : state === "error"
        ? dict.calculators.share.failed
        : dict.calculators.share.copy;

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setState("done");
        } catch {
          setState("error");
        }
      }}
      className="w-fit min-h-9 rounded-full border border-[color:var(--line)] px-4 font-sans text-xs text-dust transition-colors hover:border-amber hover:text-amber"
    >
      {label}
    </button>
  );
}
