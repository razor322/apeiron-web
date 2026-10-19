# Journey Refinement: Stage-Aware Ruler, Orbit Context, Calm Parity, Progress Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Cosmic Journey's scale legible at a glance (which stage you are in, where the body sits), give the calm path the same UI as full motion (ruler, progress bar, parallax images) without the canvas, replace the numbered 1..8 nav with a progress bar plus reset, and delete the arrival summary.

**Architecture:** The ruler becomes stage-aware: it labels each named stage and moves a marker to the stage the reader is in. In full motion that marker follows the scrubbed `progressRef`; in calm motion it follows the real scroll position via the existing reduced-branch scroll listener (`activeIndex`). The Earth stage's zoom curve is reworked so the camera first shows Earth small in its orbit around the Sun, then descends to the surface. The calm journey gains a scroll-driven parallax on its stage images and the same ruler and progress bar as full motion. The numbered stage nav and the `JourneySummary` panel are removed.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, GSAP/ScrollTrigger (full motion only), Vitest (jsdom via first-line pragma), bun.

## Global Constraints

- Copy lives only in `src/i18n/en.ts` and `src/i18n/id.ts`; the two must have identical key shape (guarded by `tests/unit/i18n.test.ts`). Components take a `dict` prop and hold no strings.
- No em dash, en dash, or `--` used as a dash in any text written by this work (antislop R-02 / humanizer section 8). Use a comma, period, colon, or parentheses.
- Every published number carries `sourceName`/`sourceUrl`, `verifiedAt`, `unit`, `confidenceType`, or it is not shown.
- TypeScript strict; `noUncheckedIndexedAccess` is on: indexed access yields `T | undefined`.
- Remote images use plain `<img>` with `// eslint-disable-next-line @next/next/no-img-element`. Internal navigation uses `next/link`.
- Accessibility: `prefers-reduced-motion: reduce` from the OS must be respected. The calm path adds only a gentle scroll-linked parallax on images (a `transform`, no layout change); it must be disabled when the OS requests reduced motion. The calm path is never pinned: it stays in normal flow.
- Reduced-motion contract: the server render and first hydration still render the calm, no-JS-readable journey (`getCalm` server snapshot is `true`). Do not break that.
- Shell is PowerShell 5.1: no `&&` (chain with `;`), use `-LiteralPath` for paths containing `[locale]`, `-UseBasicParsing` on `Invoke-WebRequest`.
- Package manager is bun. Run one test file with `bunx vitest run <path>`. Dev server is at **http://localhost:3001** (port 3000 is another app).
- The CSS gradient + star fallback (`.journey-sky`) must keep rendering in full motion if the canvas import or WebGL fails.

---

## File Structure

- Modify `src/features/cosmic-journey/stages.ts` - expose the named (content) stages with their dict label keys for the ruler. No copy moves here.
- Modify `src/features/cosmic-journey/ScaleRuler.tsx` - add per-stage labels and an active-stage marker; accept an `activeStageId` (calm) in addition to `progressRef` (full).
- Modify `src/features/cosmic-journey/CalmJourney.tsx` - remove `JourneySummary`; add the ruler, the progress bar, and a parallax wrapper on each image.
- Create `src/features/cosmic-journey/JourneyParallax.tsx` - one small client component that shifts its child with scroll, off under reduced motion.
- Create `src/features/cosmic-journey/JourneyProgressBar.tsx` - the thin progress bar plus the reset control, replacing the numbered nav.
- Modify `src/features/cosmic-journey/CosmicJourney.tsx` - swap `JourneyProgress` for `JourneyProgressBar`; delete the `JourneySummary` section; pass the active stage to the ruler.
- Modify `src/features/cosmic-journey/exponent.ts` - rework the Earth keyframes so the orbit context precedes the surface.
- Modify `src/features/cosmic-journey/scene/scene.ts` - draw Earth in its orbit before the descent (matching the new curve).
- Delete `src/features/cosmic-journey/JourneyProgress.tsx` and `src/features/cosmic-journey/JourneySummary.tsx`.
- Modify `src/i18n/en.ts`, `src/i18n/id.ts` - remove `journey.summary.*`; add `journey.progressBar.*`.
- Tests: `tests/unit/scale-ruler.test.tsx` (new), `tests/unit/journey-progress-bar.test.tsx` (new), `tests/unit/journey-parallax.test.tsx` (new), `tests/unit/exponent.test.ts` (new); delete `tests/unit/journey-summary.test.tsx` and `tests/unit/journey-progress-nav.test.tsx`.

Task order: delete the summary and swap the nav first (removes dead code the rest would otherwise touch), then the ruler, then parallax, then the orbit curve and scene.

---

### Task 1: Delete the arrival summary

**Files:**
- Delete: `src/features/cosmic-journey/JourneySummary.tsx`
- Delete: `tests/unit/journey-summary.test.tsx`
- Modify: `src/features/cosmic-journey/CosmicJourney.tsx`
- Modify: `src/features/cosmic-journey/CalmJourney.tsx`
- Modify: `src/i18n/en.ts`, `src/i18n/id.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: the journey no longer renders a summary; `journey.summary.*` keys are gone from both dictionaries.

- [ ] **Step 1: Remove the summary from the full-motion journey**

In `src/features/cosmic-journey/CosmicJourney.tsx`:
- Delete the import line `import { JourneySummary } from "./JourneySummary";`
- Delete the whole trailing section:

```tsx
      <section className="relative z-10 mx-auto w-full max-w-3xl px-6 py-[16vh]">
        <JourneySummary dict={dict} />
      </section>
```

Leave the wrapper `<div className="relative" style={{ height: `${STAGES.length * 100}vh` }}>` closing normally right after the sticky container.

- [ ] **Step 2: Remove the summary from the calm journey**

In `src/features/cosmic-journey/CalmJourney.tsx`:
- Delete the import line `import { JourneySummary } from "./JourneySummary";`
- Delete the line `<JourneySummary dict={dict} />` (currently right after the `STAGES.map(...)` block).

- [ ] **Step 3: Delete the components and their test**

```powershell
Remove-Item -LiteralPath "src/features/cosmic-journey/JourneySummary.tsx"
Remove-Item -LiteralPath "tests/unit/journey-summary.test.tsx"
```

- [ ] **Step 4: Remove the summary dictionary keys**

In `src/i18n/en.ts`, inside `journey`, delete the entire `summary: { ... }` block (keys `heading`, `ordersLine`, `stagesLine`, `factsHeading`, `complete`, `incomplete`). Do the same in `src/i18n/id.ts`.

- [ ] **Step 5: Verify parity and no dangling references**

Run: `bunx vitest run tests/unit/i18n.test.ts`
Expected: PASS (both dictionaries still key-identical).
Run: `bun run typecheck`
Expected: exit 0, no reference to `JourneySummary` remains.
Run: `bun run lint`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/features/cosmic-journey/CosmicJourney.tsx src/features/cosmic-journey/CalmJourney.tsx src/features/cosmic-journey/JourneySummary.tsx tests/unit/journey-summary.test.tsx src/i18n/en.ts src/i18n/id.ts
git commit -m "refactor: remove the journey arrival summary"
```

---

### Task 2: Replace the numbered stage nav with a progress bar and reset

**Files:**
- Create: `src/features/cosmic-journey/JourneyProgressBar.tsx`
- Delete: `src/features/cosmic-journey/JourneyProgress.tsx`
- Delete: `tests/unit/journey-progress-nav.test.tsx`
- Modify: `src/features/cosmic-journey/CosmicJourney.tsx`
- Modify: `src/features/cosmic-journey/CalmJourney.tsx`
- Modify: `src/i18n/en.ts`, `src/i18n/id.ts`
- Test: `tests/unit/journey-progress-bar.test.tsx`

**Interfaces:**
- Consumes from the store: `useJourneyLog(): { visited: string[]; reset: () => void }`.
- Produces: `JourneyProgressBar({ progressRef, activeIndex, dict, className })`. `progressRef` is optional (full motion passes it; calm passes `undefined`). In calm, the bar fills by `activeIndex / (STAGES.length - 1)`; in full motion it fills from `progressRef.current` in a rAF loop. The reset control renders only when `visited.length > 0`.

- [ ] **Step 1: Add dictionary keys**

In `src/i18n/en.ts`, inside `journey`, add:

```ts
    progressBar: {
      label: "Journey progress",
      reset: "Reset progress",
      done: "Progress cleared.",
    },
```

Mirror the same keys in `src/i18n/id.ts` with Indonesian copy (for example `label: "Kemajuan perjalanan"`, `reset: "Setel ulang kemajuan"`, `done: "Kemajuan dihapus."`). Confirm parity: `bunx vitest run tests/unit/i18n.test.ts` (PASS). The old `journey.reset.*` keys are replaced by `journey.progressBar.*`; if `git grep "journey.reset"` shows no remaining use, delete the old `reset` block from both dictionaries.

- [ ] **Step 2: Write the failing test**

```tsx
// tests/unit/journey-progress-bar.test.tsx
// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { JourneyProgressBar } from "@/features/cosmic-journey/JourneyProgressBar";
import { en } from "@/i18n/en";
import { markVisited, readVisited } from "@/lib/journey-progress";

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("journey progress bar", () => {
  it("renders a labelled progress bar with no numbered buttons", () => {
    render(<JourneyProgressBar activeIndex={2} dict={en} />);
    expect(screen.getByRole("progressbar", { name: en.journey.progressBar.label })).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("hides the reset control until there is progress", () => {
    render(<JourneyProgressBar activeIndex={0} dict={en} />);
    expect(screen.queryByRole("button", { name: en.journey.progressBar.reset })).toBeNull();
  });

  it("shows the reset control once a stage is visited and clears on click", () => {
    act(() => markVisited("earth"));
    render(<JourneyProgressBar activeIndex={1} dict={en} />);
    fireEvent.click(screen.getByRole("button", { name: en.journey.progressBar.reset }));
    expect(readVisited()).toEqual([]);
  });

  it("fills the bar by active stage when there is no progress ref", () => {
    render(<JourneyProgressBar activeIndex={0} dict={en} />);
    const bar = screen.getByRole("progressbar", { name: en.journey.progressBar.label });
    expect(bar).toHaveAttribute("aria-valuenow", "0");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `bunx vitest run tests/unit/journey-progress-bar.test.tsx`
Expected: FAIL, module `@/features/cosmic-journey/JourneyProgressBar` not found.

- [ ] **Step 4: Write the component**

```tsx
// src/features/cosmic-journey/JourneyProgressBar.tsx
"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import type { Dictionary } from "@/i18n/en";
import { STAGES, readCopy } from "./stages";
import { useJourneyLog } from "@/lib/journey-progress";

type Props = {
  activeIndex: number;
  dict: Dictionary;
  // Full motion passes the scrubbed progress ref; calm passes nothing and the
  // bar fills by stage index instead.
  progressRef?: MutableRefObject<number>;
  className?: string;
};

// A thin bar showing how far through the journey the reader is, plus a reset
// control that appears only when there is progress. No numbered buttons: the
// stage the reader is in is carried by the ruler, not by a nav.
export function JourneyProgressBar({ activeIndex, dict, progressRef, className = "" }: Props) {
  const { visited, reset } = useJourneyLog();
  const fillRef = useRef<HTMLDivElement | null>(null);
  const lastIndex = Math.max(1, STAGES.length - 1);
  const basePct = (activeIndex / lastIndex) * 100;

  useEffect(() => {
    if (!progressRef) {
      if (fillRef.current) fillRef.current.style.width = `${basePct}%`;
      return;
    }
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, Math.max(0, progressRef.current));
      if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef, basePct]);

  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-label={readCopy(dict, "journey.progressBar.label")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(basePct)}
        className="h-0.5 w-40 overflow-hidden rounded-full bg-[color:var(--line)]"
      >
        <div ref={fillRef} className="h-full w-0 bg-amber" style={{ width: `${basePct}%` }} />
      </div>
      {visited.length > 0 ? (
        <button
          type="button"
          onClick={reset}
          className="mt-2 block font-sans text-xs text-dust underline transition-colors hover:text-amber"
        >
          {readCopy(dict, "journey.progressBar.reset")}
        </button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `bunx vitest run tests/unit/journey-progress-bar.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 6: Swap the nav for the bar and delete the old nav**

In `src/features/cosmic-journey/CosmicJourney.tsx`:
- Replace the import `import { JourneyProgress } from "./JourneyProgress";` with `import { JourneyProgressBar } from "./JourneyProgressBar";`
- Replace the `<JourneyProgress ... />` element with:

```tsx
        <JourneyProgressBar
          activeIndex={activeIndex}
          progressRef={progressRef}
          dict={dict}
          className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[color:var(--line)] bg-void/70 px-4 py-2 backdrop-blur"
        />
```

In `src/features/cosmic-journey/CalmJourney.tsx`:
- Replace `import { JourneyProgress } from "./JourneyProgress";` with `import { JourneyProgressBar } from "./JourneyProgressBar";`
- Replace the `<JourneyProgress ... />` element with:

```tsx
      <JourneyProgressBar
        activeIndex={activeIndex}
        dict={dict}
        className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[color:var(--line)] bg-void/70 px-4 py-2 backdrop-blur"
      />
```

Then delete the old nav and its test:

```powershell
Remove-Item -LiteralPath "src/features/cosmic-journey/JourneyProgress.tsx"
Remove-Item -LiteralPath "tests/unit/journey-progress-nav.test.tsx"
```

- [ ] **Step 7: Run the suite**

Run: `bunx vitest run`
Expected: PASS. No reference to `JourneyProgress` remains (`git grep JourneyProgress`).
Run: `bun run typecheck ; bun run lint`
Expected: exit 0 each.

- [ ] **Step 8: Commit**

```bash
git add src/features/cosmic-journey/JourneyProgressBar.tsx src/features/cosmic-journey/JourneyProgress.tsx src/features/cosmic-journey/CosmicJourney.tsx src/features/cosmic-journey/CalmJourney.tsx tests/unit/journey-progress-bar.test.tsx tests/unit/journey-progress-nav.test.tsx src/i18n/en.ts src/i18n/id.ts
git commit -m "refactor: replace numbered stage nav with a progress bar and reset"
```

---

### Task 3: Stage-aware ruler (labels and an active marker)

**Files:**
- Modify: `src/features/cosmic-journey/stages.ts`
- Modify: `src/features/cosmic-journey/ScaleRuler.tsx`
- Modify: `src/features/cosmic-journey/CosmicJourney.tsx`
- Modify: `src/features/cosmic-journey/CalmJourney.tsx`
- Test: `tests/unit/scale-ruler.test.tsx`

**Interfaces:**
- Consumes: `STAGES`, `MAX_EXPONENT`, `readCopy` from `stages.ts`.
- Produces:
  - In `stages.ts`: `export const NAMED_STAGES = STAGES.filter((s) => s.kind === "content");` (the five labelled stages: earth, solar-system, star, galaxy, universe). Their label keys are the existing `stage.label` dictionary paths (`journey.stages.<id>.label`).
  - `ScaleRuler` gains an optional prop `activeStageId?: string`. When present (calm), the marker and the highlighted label follow that stage's exponent. When absent (full motion), they follow `progressRef` as today. Stage labels are drawn from `NAMED_STAGES` using `stage.label` and `stage.exponent`.

- [ ] **Step 1: Add the named-stage export**

In `src/features/cosmic-journey/stages.ts`, after the `STAGES` array and `MAX_EXPONENT`, add:

```ts
// The five stages that carry a real object and a name, used to label the ruler.
// The hero, the mid transition, and the outro are typographic and stay unlabelled.
export const NAMED_STAGES = STAGES.filter((stage) => stage.kind === "content");
```

- [ ] **Step 2: Write the failing test**

```tsx
// tests/unit/scale-ruler.test.tsx
// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ScaleRuler } from "@/features/cosmic-journey/ScaleRuler";
import { en } from "@/i18n/en";
import { NAMED_STAGES } from "@/features/cosmic-journey/stages";

afterEach(cleanup);

describe("scale ruler", () => {
  it("labels every named stage", () => {
    render(<ScaleRuler exponent={7} activeStageId="earth" dict={en} />);
    expect(screen.getByText(en.journey.stages.earth.label)).toBeInTheDocument();
  });

  it("renders five named-stage labels", () => {
    render(<ScaleRuler exponent={7} activeStageId="earth" dict={en} />);
    const shown = NAMED_STAGES.filter((s) => {
      let node: unknown = en;
      for (const key of s.label.split(".")) node = (node as Record<string, unknown>)[key];
      return typeof node === "string" && screen.queryByText(node) !== null;
    });
    expect(shown.length).toBe(NAMED_STAGES.length);
  });

  it("marks the active stage", () => {
    render(<ScaleRuler exponent={7} activeStageId="earth" dict={en} />);
    expect(screen.getByText(en.journey.stages.earth.label)).toHaveAttribute("data-active", "true");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `bunx vitest run tests/unit/scale-ruler.test.tsx`
Expected: FAIL, `data-active` and stage labels not rendered (current ruler only draws the three orbit landmarks).

- [ ] **Step 4: Rework `ScaleRuler`**

In `src/features/cosmic-journey/ScaleRuler.tsx`, change the imports and prop type:

```tsx
import { useEffect, useRef, type MutableRefObject } from "react";
import type { Dictionary } from "@/i18n/en";
import { MAX_EXPONENT, NAMED_STAGES, readCopy } from "./stages";
import { exponentAtProgress } from "./exponent";

type ScaleRulerProps = {
  progressRef?: MutableRefObject<number>;
  exponent: number;
  dict: Dictionary;
  // The stage the reader is in, when known (calm motion). Full motion leaves it
  // undefined and the marker follows the scrubbed progress instead.
  activeStageId?: string;
  className?: string;
};
```

Replace the `LANDMARKS` array with nothing (delete it). Replace the effect so calm uses the active stage's exponent and full motion keeps the rAF loop:

```tsx
  useEffect(() => {
    if (!progressRef) {
      const e = activeStageId
        ? NAMED_STAGES.find((s) => s.id === activeStageId)?.exponent ?? exponent
        : exponent;
      if (markerRef.current) markerRef.current.style.bottom = `${Math.min(100, (e / MAX_EXPONENT) * 100)}%`;
      if (expRef.current) expRef.current.textContent = `10${superscript(e)} m`;
      return;
    }
    let raf = 0;
    let lastExp = -1;
    const tick = () => {
      const e = exponentAtProgress(progressRef.current);
      if (markerRef.current) markerRef.current.style.bottom = `${Math.min(100, (e / MAX_EXPONENT) * 100)}%`;
      const whole = Math.floor(e);
      if (whole !== lastExp && expRef.current) {
        expRef.current.textContent = `10${superscript(e)} m`;
        lastExp = whole;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef, exponent, activeStageId]);
```

Replace the `LANDMARKS.map(...)` block in the render with:

```tsx
        {NAMED_STAGES.map((stage) => {
          const active = stage.id === activeStageId;
          return (
            <span
              key={stage.id}
              data-active={active ? "true" : undefined}
              className={`absolute right-4 -translate-y-1/2 whitespace-nowrap font-sans text-[11px] transition-colors ${
                active ? "text-amber" : "text-dust"
              }`}
              style={{ bottom: `${(stage.exponent / MAX_EXPONENT) * 100}%` }}
            >
              {readCopy(dict, stage.label)}
            </span>
          );
        })}
```

Keep the ticks, the marker span, the `role="img"` wrapper and its `aria-label`, and the exponent readout paragraph.

- [ ] **Step 5: Run the test to verify it passes**

Run: `bunx vitest run tests/unit/scale-ruler.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 6: Pass `activeStageId` from both journeys**

In `src/features/cosmic-journey/CosmicJourney.tsx`, add `activeStageId` to the existing `<ScaleRuler ... />`:

```tsx
        <ScaleRuler
          progressRef={progressRef}
          exponent={STAGES[activeIndex]?.exponent ?? 0}
          activeStageId={STAGES[activeIndex]?.id}
          dict={dict}
          className="absolute right-[clamp(18px,2.4vw,30px)] top-1/2 z-10 hidden w-44 -translate-y-1/2 text-right md:block"
        />
```

In `src/features/cosmic-journey/CalmJourney.tsx`, the ruler has no `progressRef` and uses `activeStageId` only (place it right after the `STAGES.map(...)` block, since Task 1 removed the summary that sat there):

```tsx
        <div className="pb-28 pt-8">
          <ScaleRuler
            exponent={STAGES[activeIndex]?.exponent ?? 0}
            activeStageId={STAGES[activeIndex]?.id}
            dict={dict}
          />
        </div>
```

- [ ] **Step 7: Run the suite and typecheck**

Run: `bunx vitest run ; bun run typecheck`
Expected: PASS, exit 0.

- [ ] **Step 8: Commit**

```bash
git add src/features/cosmic-journey/stages.ts src/features/cosmic-journey/ScaleRuler.tsx src/features/cosmic-journey/CosmicJourney.tsx src/features/cosmic-journey/CalmJourney.tsx tests/unit/scale-ruler.test.tsx
git commit -m "feat: label the ruler by stage and mark the active one"
```

---

### Task 4: Parallax images in the calm journey

**Files:**
- Create: `src/features/cosmic-journey/JourneyParallax.tsx`
- Modify: `src/features/cosmic-journey/CalmJourney.tsx`
- Test: `tests/unit/journey-parallax.test.tsx`

**Interfaces:**
- Consumes: `getReducedMotion()` from `@/lib/motion-preference`.
- Produces: `JourneyParallax({ children, className })` - a client component that translates its children by a small, scroll-linked offset. It renders children unchanged (no transform) when the OS requests reduced motion, or before hydration.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/journey-parallax.test.tsx
// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { JourneyParallax } from "@/features/cosmic-journey/JourneyParallax";

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia;
});
afterEach(cleanup);

describe("journey parallax", () => {
  it("renders its children", () => {
    render(
      <JourneyParallax>
        <span>the image</span>
      </JourneyParallax>,
    );
    expect(screen.getByText("the image")).toBeInTheDocument();
  });

  it("adds no transform when the OS requests reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
    const { container } = render(
      <JourneyParallax>
        <span>still</span>
      </JourneyParallax>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transform).toBe("");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run tests/unit/journey-parallax.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Write the component**

```tsx
// src/features/cosmic-journey/JourneyParallax.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!getReducedMotion());
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (ref.current) ref.current.style.transform = "";
      return;
    }
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        const shift = Math.max(-18, Math.min(18, -center * 0.04));
        el.style.transform = `translateY(${shift}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run tests/unit/journey-parallax.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Wrap the calm image**

In `src/features/cosmic-journey/CalmJourney.tsx`, import `JourneyParallax`:

```tsx
import { JourneyParallax } from "./JourneyParallax";
```

Wrap the `<img>` (the border and rounding move to the wrapper; `overflow-hidden` keeps the shift from bleeding):

```tsx
      {showImage ? (
        <JourneyParallax className="overflow-hidden rounded-sm border border-[color:var(--line)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image!.previewUrl}
            alt={image!.altText}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="aspect-[16/9] w-full object-cover"
          />
        </JourneyParallax>
      ) : null}
```

- [ ] **Step 6: Run the suite**

Run: `bunx vitest run ; bun run typecheck ; bun run lint`
Expected: PASS, exit 0 each.

- [ ] **Step 7: Commit**

```bash
git add src/features/cosmic-journey/JourneyParallax.tsx src/features/cosmic-journey/CalmJourney.tsx tests/unit/journey-parallax.test.tsx
git commit -m "feat: add scroll parallax to calm journey images"
```

---

### Task 5: Show Earth in its orbit before the descent

**Files:**
- Modify: `src/features/cosmic-journey/exponent.ts`
- Modify: `src/features/cosmic-journey/scene/scene.ts`
- Modify: `src/features/cosmic-journey/CosmicJourney.tsx` (add the orbit label to the scene's star labels)
- Modify: `src/i18n/en.ts`, `src/i18n/id.ts` (add `journey.landmarks.earthOrbit` if missing)
- Test: `tests/unit/exponent.test.ts` (new)

**Interfaces:**
- Consumes: nothing new.
- Produces: `exponentAtProgress` reworked so the Earth stage passes through an orbit opening (around e 9.5) before the surface (e 7.2). The equivalent `KEYFRAMES` in `scene.ts` are updated to match, and the Earth drawing gains an orbit view band.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/exponent.test.ts
import { describe, it, expect } from "vitest";
import { exponentAtProgress, MAX_EXPONENT } from "@/features/cosmic-journey/exponent";

describe("exponentAtProgress", () => {
  it("starts at a person and ends at the observable universe", () => {
    expect(exponentAtProgress(0)).toBeCloseTo(0, 1);
    expect(exponentAtProgress(1)).toBeCloseTo(MAX_EXPONENT, 1);
  });

  it("opens onto Earth's orbit before the surface, then descends to it", () => {
    const orbitPeak = exponentAtProgress(0.24);
    const surface = exponentAtProgress(0.3);
    expect(orbitPeak).toBeGreaterThan(surface);
    expect(surface).toBeLessThan(8);
  });

  it("never decreases across the whole range above the orbit peak", () => {
    let last = -1;
    for (let p = 0.35; p <= 1; p += 0.02) {
      const e = exponentAtProgress(p);
      expect(e).toBeGreaterThanOrEqual(last - 0.001);
      last = e;
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bunx vitest run tests/unit/exponent.test.ts`
Expected: FAIL: today the curve only rises, so `orbitPeak > surface` is false.

- [ ] **Step 3: Rework the Earth keyframes in `exponent.ts`**

Replace `KEYFRAMES` so the curve dips for the Earth stage: rise to an orbit scale, then descend to the surface before continuing outward. Keep every other stage's value:

```ts
const KEYFRAMES: [number, number][] = [
  [0, 0.3],
  [0.07, 0.3],
  [0.17, 5.2],
  [0.22, 9.5], // open onto Earth's orbit
  [0.26, 9.5],
  [0.3, 7.2], // descend to the Earth surface
  [0.38, 7.2],
  [0.5, 9.2],
  [0.57, 9.2],
  [0.68, 11.3],
  [0.74, 11.3],
  [0.86, 13.05],
  [0.9, 13.05],
  [0.94, 21],
  [0.97, 27],
  [1, 27],
];
```

The dip (0.26 to 0.30) is intentional, confined to the Earth stage. Above the orbit peak the curve is monotonic, which the last test checks.

- [ ] **Step 4: Run the test to verify it passes**

Run: `bunx vitest run tests/unit/exponent.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Mirror the keyframes in the scene**

In `src/features/cosmic-journey/scene/scene.ts`, update its own `KEYFRAMES` (currently the same list) to match the new curve exactly, so the canvas camera and the ruler describe the same moment. Change nothing else in that block.

- [ ] **Step 6: Draw the orbit view**

In `src/features/cosmic-journey/scene/scene.ts`, in `render`, add an orbit-context band placed next to the existing `orbA` orbit-ring block. It shows the Sun, Earth's orbit ring, and Earth as a dot on that ring while the exponent is in the orbit opening:

```ts
    // Earth's orbit seen from outside: a brief context view as the zoom opens
    // onto the Earth stage, so the reader sees where Earth sits before the
    // camera descends to the surface.
    const eoA = smooth(8.6, 9.2, e) * (1 - smooth(9.6, 10.2, e)) * localFade;
    if (eoA > 0.01) {
      ctx.save();
      ctx.globalAlpha = eoA * 0.5;
      ctx.strokeStyle = "rgba(232,228,220,1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, AU * ppm, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = eoA;
      const ep = project(AU, 0);
      ctx.fillStyle = "#8FB0E8";
      ctx.beginPath();
      ctx.arc(ep[0], ep[1], Math.max(RE * ppm, 2), 0, TAU);
      ctx.fill();
      const name = labels?.stars["journey.landmarks.earthOrbit"];
      if (name) label(name, ep[0] + 7, ep[1] - 7, eoA * 0.8, "#9A9CA6");
      ctx.restore();
    }
```

- [ ] **Step 7: Add the orbit label to the scene labels**

In `src/features/cosmic-journey/CosmicJourney.tsx`, add the key to the `starLabels` map built before `createScene`:

```tsx
      "journey.landmarks.earthOrbit": readCopy(dict, "journey.landmarks.earthOrbit"),
```

In `src/i18n/en.ts`, under `journey.landmarks`, the key `earthOrbit` already exists (value "Earth's orbit"). Confirm it in both dictionaries; if absent in `id.ts`, add `earthOrbit: "orbit Bumi"`. Run `bunx vitest run tests/unit/i18n.test.ts` (PASS).

- [ ] **Step 8: Run the suite, typecheck, build**

Run: `bunx vitest run ; bun run typecheck ; bun run lint ; bun run build`
Expected: PASS, exit 0. Build compiles; the calculators and journey routes render.

- [ ] **Step 9: Commit**

```bash
git add src/features/cosmic-journey/exponent.ts src/features/cosmic-journey/scene/scene.ts src/features/cosmic-journey/CosmicJourney.tsx src/i18n/en.ts src/i18n/id.ts tests/unit/exponent.test.ts
git commit -m "feat: show Earth in its orbit before descending to the surface"
```

---

### Task 6: Full gate and live verification

**Files:**
- Modify: `docs/runbook.md` (only if a behavior note is needed)

- [ ] **Step 1: Run the full gate**

```powershell
bunx vitest run
bun run lint
bun run typecheck
bun run build
```

Expected: all tests pass, no lint error, zero TypeScript error, clean build.

- [ ] **Step 2: Live check at port 3001**

Dev server runs at http://localhost:3001. Confirm by inspecting the rendered HTML and by scrolling:

- The arrival summary is gone from `/en` (full motion) and the calm path.
- No numbered 1..8 buttons; a thin labelled progress bar is present, and the reset control appears only after a stage is opened.
- The ruler shows the five stage names (Earth, Solar System, Star, Galaxy, Universe) and highlights the one the reader is in, in both modes.
- In full motion, scrolling into the Earth stage shows Earth in its orbit around the Sun before the surface fills the frame.
- In calm motion, each stage image shifts gently as the page scrolls (and does not shift when the OS requests reduced motion).

Record each result as evidence.

- [ ] **Step 3: Commit any doc change**

```bash
git add docs/runbook.md
git commit -m "docs: note journey ruler and calm parallax behavior"
```

---

## Self-Review

**Spec coverage:**
- Summary removed entirely: Task 1.
- Numbered 1..8 nav replaced by a progress bar plus reset: Task 2.
- Ruler shows which stage the reader is in: Task 3 (per-stage labels plus `data-active` marker, driven by `activeStageId` in calm and `progressRef` in full).
- Canvas shows where Earth sits in its orbit: Task 5 (orbit keyframes plus an orbit-context band).
- Calm and full motion "setara": Tasks 2, 3, 4 give calm the same ruler, progress bar, and reset as full motion, plus a parallax the full path has through motion. Task 4 disables that parallax under OS reduced motion.
- Parallax meaning: settled as calm-only image parallax (Task 4).

**Recorded conflict:** an earlier answer said to remove the ruler from calm; the user's later decision (calm must match full motion) supersedes it, so the plan keeps the ruler in calm for parity.

**Placeholder scan:** no TBD. Every code step shows the code. Task 5 checks the `journey.landmarks.earthOrbit` key and adds it if missing.

**Type consistency:** `JourneyProgressBar` prop shape (`activeIndex`, `dict`, `progressRef?`, `className`) matches both call sites in Task 2 Step 6. `ScaleRuler` gains `activeStageId?` used in Tasks 3 and 5. `NAMED_STAGES` is defined and consumed in Task 3. `JourneyParallax` is defined and consumed in Task 4. The store API (`useJourneyLog`) is unchanged.
