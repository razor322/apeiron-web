# Journey Refinement 2 (ALL TASKS DONE, merged to main): Strip, Restore, and Make the Cosmos Interactive

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the progress bar, restore the monotone zoom, show the Moon at the Earth stage, name and link the eight planets, and turn the Observable Universe and home into entry points into Explore.

**Scope:** full motion only. The calm path keeps its current behaviour in this plan; parity work for calm is a later, separate plan.

**Architecture:** Two components carry all the new interactivity, `PlanetRow` and `CosmosGrid`, both plain server-renderable components using `next/link`. They are rendered from `JourneyStage` when the stage id is `solar-system` or `universe`. The scene reverts Task 5 (no curve dip, no orbit band) and adds a Moon that stays visible through the Earth surface stage. A small hit-test on the canvas makes drawn planets and nearby stars clickable, but every destination is also reachable from the grid and row, so the canvas is a bonus path, never the only one. Because home is `CosmicJourney` itself, "home sections" and "journey sections" are the same render tree; the Earth facts land in the index (hero/earth) area and the planet row lands on the Solar System stage.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, GSAP/ScrollTrigger, Vitest (jsdom via first-line pragma), bun.

## Global Constraints

- Copy lives only in `src/i18n/en.ts` and `src/i18n/id.ts`; the two must have identical key shape (guarded by `tests/unit/i18n.test.ts`). Components take a `dict` prop and hold no strings.
- No em dash, en dash, or `--` used as a dash in any text written by this work (antislop R-02 / humanizer section 8). Use a comma, period, colon, or parentheses.
- Every published number carries `sourceName`/`sourceUrl`, `verifiedAt`, `unit`, `confidenceType`, or it is not shown (R-17/R-38). The facts added here use only what the cited NASA page states, quoted below; no number is invented.
- TypeScript strict; `noUncheckedIndexedAccess` is on: indexed access yields `T | undefined`.
- Remote images use plain `<img>` with `// eslint-disable-next-line @next/next/no-img-element`. Internal navigation uses `next/link`.
- Accessibility: every clickable planet or cosmos tile is a real link with an accessible name, keyboard reachable, with the global `:focus-visible` outline left intact. A canvas-only click target is a bonus; the grid and row are the accessible path.
- The OS `prefers-reduced-motion` contract is untouched: the canvas still runs only in full motion.
- Shell is PowerShell 5.1: no `&&` (chain with `;`), use `-LiteralPath` for paths containing `[locale]`, `-UseBasicParsing` on `Invoke-WebRequest`.
- Package manager is bun. Run one test file with `bunx vitest run <path>`. The dev server is at **http://localhost:3000** (this project's own server).

### Verified source for the new facts

The page `https://science.nasa.gov/universe/galaxies/` (NASA Science, reachable and confirmed during planning) states, verbatim:

- "Our home galaxy is called the Milky Way. It's a spiral galaxy with a disk of stars spanning more than 100,000 light-years."
- "Earth is located along one of the galaxy's spiral arms, about halfway from the center."
- "Our solar system takes about 240 million years to orbit the Milky Way just once."

That page does **not** state "26,000 light-years" or "Orion Arm". So the facts below use "about halfway from the center" and "spiral arm", not the unverified figures, and cite this page. If a future editor wants the exact figure, they add a new fact with a source that states it.

---

## File Structure

- Delete `src/features/cosmic-journey/JourneyProgressBar.tsx` and `tests/unit/journey-progress-bar.test.tsx`.
- Modify `src/features/cosmic-journey/CosmicJourney.tsx` - remove the progress bar usage; keep the canvas.
- Modify `src/features/cosmic-journey/CalmJourney.tsx` - remove the progress bar usage only.
- Modify `src/features/cosmic-journey/exponent.ts` - revert KEYFRAMES to the monotone curve.
- Modify `src/features/cosmic-journey/scene/scene.ts` - revert KEYFRAMES, delete the orbit band, show the Moon at the Earth surface stage, add `hitTest`.
- Modify `src/features/cosmic-journey/stages.ts` - add the two new Earth facts to the earth stage `factIds`.
- Modify `src/features/cosmic-journey/JourneyStage.tsx` - render `PlanetRow` (solar-system) and `CosmosGrid` (universe); accept `locale`.
- Create `src/features/cosmic-journey/PlanetRow.tsx` - the eight planets as links with names and hover taglines.
- Create `src/features/cosmic-journey/CosmosGrid.tsx` - the Explore categories as links.
- Modify `src/features/cosmic-facts/facts.ts` - add two Earth-position facts with the verified source.
- Modify `src/i18n/en.ts`, `src/i18n/id.ts` - new keys for the planet row, cosmos grid, and the two facts' copy.
- Tests: `tests/unit/planet-row.test.tsx` (new), `tests/unit/cosmos-grid.test.tsx` (new), `tests/unit/earth-position-facts.test.ts` (new); edit `tests/unit/exponent.test.ts` to the monotone contract; delete `tests/unit/journey-progress-bar.test.tsx`.

Task order: strip (1), restore and Moon (2), planets (3), cosmos grid and canvas hit (4), facts and wiring (5), gate (6).

---

### Task 1: Remove the progress bar and reset

**Files:**
- Delete: `src/features/cosmic-journey/JourneyProgressBar.tsx`
- Delete: `tests/unit/journey-progress-bar.test.tsx`
- Modify: `src/features/cosmic-journey/CosmicJourney.tsx`
- Modify: `src/features/cosmic-journey/CalmJourney.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: neither journey renders a progress bar or reset control.

> **Status: DONE** (commit `b6ec090`, review clean). 169 tests pass, lint 0, typecheck 0.

- [x] **Step 1: Remove it from both journeys**

In `src/features/cosmic-journey/CosmicJourney.tsx`: delete the import `import { JourneyProgressBar } from "./JourneyProgressBar";` and delete the `<JourneyProgressBar ... />` element (the one with `className="absolute bottom-6 left-1/2 z-20 ..."`).

In `src/features/cosmic-journey/CalmJourney.tsx`: delete the import `import { JourneyProgressBar } from "./JourneyProgressBar";` and delete the `<JourneyProgressBar ... />` element (the one with `className="fixed bottom-6 left-1/2 z-20 ..."`).

- [x] **Step 2: Delete the component and its test**

```powershell
Remove-Item -LiteralPath "src/features/cosmic-journey/JourneyProgressBar.tsx"
Remove-Item -LiteralPath "tests/unit/journey-progress-bar.test.tsx"
```

- [x] **Step 3: Verify**

Run: `bun run typecheck ; bun run lint`
Expected: exit 0; `git grep JourneyProgressBar` finds nothing in `src` or `tests`.
Run: `bunx vitest run`
Expected: PASS (one fewer file).

- [x] **Step 4: Commit**

```bash
git add src/features/cosmic-journey/JourneyProgressBar.tsx src/features/cosmic-journey/CosmicJourney.tsx src/features/cosmic-journey/CalmJourney.tsx tests/unit/journey-progress-bar.test.tsx
git commit -m "refactor: remove the journey progress bar and reset control"
```

---

> **Status: DONE** (commit `0c595c6`, review clean). 169 tests pass, lint 0, typecheck 0, build green.

### Task 2: Restore the monotone curve and show the Moon at Earth

> **Status: DONE** (commit 0c595c6, review clean). 169 tests pass, lint 0, typecheck 0, build green.

**Files:**
- Modify: `src/features/cosmic-journey/exponent.ts`
- Modify: `src/features/cosmic-journey/scene/scene.ts`
- Modify: `tests/unit/exponent.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `exponentAtProgress` is monotone again; the scene KEYFRAMES match; the Earth surface stage draws a visible Moon.

- [x] **Step 1: Write the failing test (monotone contract)**

Replace the whole body of `tests/unit/exponent.test.ts` with:

```ts
import { describe, it, expect } from "vitest";
import { exponentAtProgress, MAX_EXPONENT } from "@/features/cosmic-journey/exponent";

describe("exponentAtProgress", () => {
  it("starts near a person and ends at the observable universe", () => {
    expect(exponentAtProgress(0)).toBeCloseTo(0.3, 1);
    expect(exponentAtProgress(1)).toBeCloseTo(MAX_EXPONENT, 1);
  });

  it("never decreases across the whole range", () => {
    let last = -1;
    for (let p = 0; p <= 1; p += 0.01) {
      const e = exponentAtProgress(p);
      expect(e).toBeGreaterThanOrEqual(last - 0.001);
      last = e;
    }
  });

  it("passes through the Earth surface scale without an orbit dip", () => {
    // The Earth stage sits at the surface scale, roughly 7.2. With the dip
    // removed there is no point above it that the curve returns to after.
    expect(exponentAtProgress(0.3)).toBeLessThan(8);
    expect(exponentAtProgress(0.3)).toBeGreaterThan(6);
    expect(exponentAtProgress(0.35)).toBeGreaterThanOrEqual(exponentAtProgress(0.3) - 0.001);
  });
});
```

- [x] **Step 2: Run to verify it fails**

Run: `bunx vitest run tests/unit/exponent.test.ts`
Expected: FAIL on the monotone test (the current curve has the orbit dip at p 0.22-0.30).

- [x] **Step 3: Revert the curve in `exponent.ts`**

Replace `KEYFRAMES` in `src/features/cosmic-journey/exponent.ts` with:

```ts
const KEYFRAMES: [number, number][] = [
  [0, 0.3],
  [0.07, 0.3],
  [0.17, 5.2],
  [0.28, 7.2],
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

- [x] **Step 4: Run to verify it passes**

Run: `bunx vitest run tests/unit/exponent.test.ts`
Expected: PASS, 3 tests.

- [x] **Step 5: Mirror the curve and delete the orbit band in `scene.ts`**

In `src/features/cosmic-journey/scene/scene.ts`:
- Replace its `KEYFRAMES` with the identical monotone list from Step 3.
- Delete the whole "Earth's orbit seen from outside" block: the `const eoA = ...` line and its `if (eoA > 0.01) { ... }` body. Delete nothing else around it.

- [x] **Step 6: Add a Moon visible at the Earth surface stage**

In `scene.ts`, the Moon block currently gates on `const mA = smooth(8, 8.6, e) * (1 - smooth(10, 10.8, e)) * localFade;`, which never fires at the Earth surface scale (e around 7.2). Replace that gate and the drawing so the Moon shows beside Earth while the surface is on screen.

Replace the existing Moon block (from its comment through its closing brace) with:

```ts
    // Moon: shown while the Earth stage is on screen, so the surface view is not
    // an Earth with no companion. While Earth is a small disc the Moon orbits on
    // a faint ring; once the surface fills the frame the ring is meaningless, so
    // the Moon is drawn beside the globe instead.
    const mA = smooth(6.8, 7.4, e) * (1 - smooth(9.5, 10.4, e)) * localFade;
    if (mA > 0.01) {
      if (Rpx > 2000) {
        const mx = ex + Rpx * 0.62;
        const my = ey - Rpx * 0.18;
        ctx.save();
        ctx.globalAlpha = mA;
        ctx.fillStyle = "#CFCBC2";
        ctx.beginPath();
        ctx.arc(mx, my, Math.max(Rpx * 0.045, 5), 0, TAU);
        ctx.fill();
        ctx.restore();
      } else {
        const mp = project(AU + LM * Math.cos(0.35), LM * Math.sin(0.35));
        const mr = LM * ppm;
        if (mr < 20000) {
          ctx.strokeStyle = `rgba(232,228,220,${0.14 * mA})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(ex, ey, mr, 0, TAU);
          ctx.stroke();
        }
        ctx.save();
        ctx.strokeStyle = `rgba(232,228,220,${0.28 * mA})`;
        ctx.setLineDash([2, 5]);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(mp[0], mp[1]);
        ctx.stroke();
        ctx.restore();
        ctx.globalAlpha = mA;
        ctx.fillStyle = "#CFCBC2";
        ctx.beginPath();
        ctx.arc(mp[0], mp[1], Math.max(RM * ppm, 1.7), 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
```

Note: this block must run after `ex`, `ey`, `Rpx`, `AU`, `LM`, `RM`, and `project` are defined in `render` (they are, by the time the old Moon block ran). Keep its position in `render`.

- [x] **Step 7: Run suite, typecheck, lint, build**

Run: `bunx vitest run ; bun run typecheck ; bun run lint ; bun run build`
Expected: PASS, exit 0.

- [x] **Step 8: Commit**

```bash
git add src/features/cosmic-journey/exponent.ts src/features/cosmic-journey/scene/scene.ts tests/unit/exponent.test.ts
git commit -m "fix: restore the monotone zoom and show the Moon at Earth"
```

---

> **Status: DONE** (commit 9286463, review clean). 171 tests pass, lint 0, typecheck 0.

### Task 3: Planet row on the Solar System stage

> **Status: DONE** (commit 9286463, review clean). 171 tests pass, lint 0, typecheck 0.

**Files:**
- Create: `src/features/cosmic-journey/PlanetRow.tsx`
- Modify: `src/features/cosmic-journey/JourneyStage.tsx`
- Modify: `src/features/cosmic-journey/CosmicJourney.tsx`
- Modify: `src/features/cosmic-journey/CalmJourney.tsx`
- Modify: `src/i18n/en.ts`, `src/i18n/id.ts`
- Test: `tests/unit/planet-row.test.tsx`

**Interfaces:**
- Consumes: `PLANETS` from `src/features/explorer/planets.ts` (each profile has `slug`, `nameKey`, `taglineKey`); `getText(dict, key)` from `src/features/explorer/categories.ts`; `next/link`; `readCopy` from `./stages`.
- Produces: `PlanetRow({ locale, dict, className })`; `JourneyStage` gains a required `locale: Locale` prop.

- [x] **Step 1: Add dictionary keys**

In `src/i18n/en.ts`, inside `journey`, add:

```ts
    planets: {
      heading: "The eight planets",
      intro: "Each world bound to the Sun. Open one to see its size, distance, and pace.",
    },
```

Mirror the same keys in `src/i18n/id.ts` (for example `heading: "Delapan planet"`, `intro: "Tiap dunia yang terikat Matahari. Buka satu untuk melihat ukuran, jarak, dan kecepatannya."`). Run `bunx vitest run tests/unit/i18n.test.ts` and expect PASS.

- [x] **Step 2: Write the failing test**

```tsx
// tests/unit/planet-row.test.tsx
// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PlanetRow } from "@/features/cosmic-journey/PlanetRow";
import { en } from "@/i18n/en";
import { PLANETS } from "@/features/explorer/planets";

afterEach(cleanup);

describe("planet row", () => {
  it("links every planet to its detail page", () => {
    render(<PlanetRow locale="en" dict={en} />);
    for (const p of PLANETS) {
      const link = screen.getByRole("link", { name: new RegExp(`^${p.slug}$`, "i") });
      expect(link).toHaveAttribute("href", `/en/explore/planet/${p.slug}`);
    }
  });

  it("shows the heading and intro", () => {
    render(<PlanetRow locale="en" dict={en} />);
    expect(screen.getByText(en.journey.planets.heading)).toBeInTheDocument();
    expect(screen.getByText(en.journey.planets.intro)).toBeInTheDocument();
  });
});
```

The accessible name is asserted as the slug. If the visible label is the localized planet name (for example "Mercury"), the implementer must change the assertion to `new RegExp(p.nameKey.split(".").pop()!, "i")` so the test matches what is rendered. Pick one and keep it consistent.

- [x] **Step 3: Run to verify it fails**

Run: `bunx vitest run tests/unit/planet-row.test.tsx`
Expected: FAIL, module not found.

- [x] **Step 4: Write `PlanetRow`**

```tsx
// src/features/cosmic-journey/PlanetRow.tsx
import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { PLANETS } from "@/features/explorer/planets";
import { getText } from "@/features/explorer/categories";
import { readCopy } from "./stages";

// The eight planets as links into Explore. Names come from the existing
// explore.planets.* keys; the tagline rides along as a title so a reader who does
// not know the shapes still learns which world is which.
export function PlanetRow({
  locale,
  dict,
  className = "",
}: {
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-sans text-sm uppercase tracking-wide text-dust">
        {readCopy(dict, "journey.planets.heading")}
      </h3>
      <p className="mt-1 mb-4 max-w-[34rem] font-sans text-sm text-dust">
        {readCopy(dict, "journey.planets.intro")}
      </p>
      <ul className="flex flex-wrap gap-2">
        {PLANETS.map((planet) => {
          const name = String(getText(dict, planet.nameKey) ?? planet.slug);
          const tagline = String(getText(dict, planet.taglineKey) ?? "");
          return (
            <li key={planet.slug}>
              <Link
                href={`/${locale}/explore/planet/${planet.slug}`}
                title={tagline}
                className="block rounded-full border border-[color:var(--line)] px-3 py-1 font-sans text-xs text-dust transition-colors hover:border-amber hover:text-amber"
              >
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [x] **Step 5: Run to verify it passes**

Run: `bunx vitest run tests/unit/planet-row.test.tsx`
Expected: PASS, 2 tests.

- [x] **Step 6: Wire it into `JourneyStage` and pass `locale`**

In `src/features/cosmic-journey/JourneyStage.tsx`:
- Add `import type { Locale } from "@/i18n/config";` and `import { PlanetRow } from "./PlanetRow";`.
- Add `locale: Locale;` to `JourneyStageProps`.
- Destructure `locale` in the component.
- In the non-hero return, after the facts `<details>` block, add:

```tsx
      {stage.id === "solar-system" ? (
        <PlanetRow locale={locale} dict={dict} className="mt-8 max-w-[34rem]" />
      ) : null}
```

In `src/features/cosmic-journey/CosmicJourney.tsx`, both `<JourneyStage ... />` usages (there is one in the motion branch) must pass `locale={locale}` (the component already has `locale`).

In `src/features/cosmic-journey/CalmJourney.tsx`, add `locale: Locale` to its props, forward `locale` from `CosmicJourney` (it already has `locale`), and pass `locale={locale}` to its `<JourneyStage ... />` in `CalmStage` (thread `locale` through `CalmStage` too).

- [x] **Step 7: Run suite, typecheck, lint**

Run: `bunx vitest run ; bun run typecheck ; bun run lint`
Expected: PASS, exit 0.

- [x] **Step 8: Commit**

```bash
git add src/features/cosmic-journey/PlanetRow.tsx src/features/cosmic-journey/JourneyStage.tsx src/features/cosmic-journey/CosmicJourney.tsx src/features/cosmic-journey/CalmJourney.tsx src/i18n/en.ts src/i18n/id.ts tests/unit/planet-row.test.tsx
git commit -m "feat: list and link the eight planets on the Solar System stage"
```

---

> **Status: DONE** (commits 9d7214f, 5291720, review clean). 172 tests pass, lint 0, typecheck 0.

### Task 4: Cosmos grid on the Universe stage and canvas click targets

> **Status: DONE** (commits 9d7214f, 5291720, review clean). 172 tests pass, lint 0, typecheck 0.

**Files:**
- Create: `src/features/cosmic-journey/CosmosGrid.tsx`
- Modify: `src/features/cosmic-journey/JourneyStage.tsx`
- Modify: `src/features/cosmic-journey/CosmicJourney.tsx`
- Modify: `src/features/cosmic-journey/scene/scene.ts`
- Modify: `src/i18n/en.ts`, `src/i18n/id.ts`
- Test: `tests/unit/cosmos-grid.test.tsx`

**Interfaces:**
- Consumes: `CATEGORIES`, `getText(dict, key)` from `src/features/explorer/categories.ts`; `next/link`; `readCopy`.
- Produces:
  - `CosmosGrid({ locale, dict, className })` linking to `/{locale}/explore/{slug}` for every category.
  - In `scene.ts`, `SceneHandle.hitTest(x: number, y: number): string | null` returning a category slug (`"planet"`, `"star"`, `"galaxy"`) when the point lands on a drawn body, else `null`.

- [x] **Step 1: Add dictionary keys**

In `src/i18n/en.ts`, inside `journey`, add:

```ts
    cosmos: {
      heading: "Where to next",
      intro: "The field is full of galaxies. Open any of these to keep exploring.",
    },
```

Mirror in `src/i18n/id.ts`. Parity: PASS.

- [x] **Step 2: Write the failing test**

```tsx
// tests/unit/cosmos-grid.test.tsx
// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CosmosGrid } from "@/features/cosmic-journey/CosmosGrid";
import { en } from "@/i18n/en";
import { CATEGORIES } from "@/features/explorer/categories";

afterEach(cleanup);

describe("cosmos grid", () => {
  it("links every explore category", () => {
    render(<CosmosGrid locale="en" dict={en} />);
    for (const c of CATEGORIES) {
      const href = c.slug === "planet" ? "/en/explore/planet" : `/en/explore/${c.slug}`;
      const link = screen.getByRole("link", { name: new RegExp(c.slug.replace("-", " "), "i") });
      expect(link).toHaveAttribute("href", href);
    }
  });
});
```

Note: `planet` has its own index route at `/explore/planet` (a real page listing the eight planets), which Next serves ahead of the `[slug]` topic route. The other categories land on `/explore/[slug]`. If the accessible-name match is brittle because the visible text is a localized name, match by the dictionary name via `getText` instead; keep the `href` assertion.

- [x] **Step 3: Run to verify it fails**

Run: `bunx vitest run tests/unit/cosmos-grid.test.tsx`
Expected: FAIL, module not found.

- [x] **Step 4: Write `CosmosGrid`**

```tsx
// src/features/cosmic-journey/CosmosGrid.tsx
import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { CATEGORIES, getText } from "@/features/explorer/categories";
import { readCopy } from "./stages";

// The widest view doubles as the most navigable: every Explore category as a
// link, so the Observable Universe stage leads somewhere.
export function CosmosGrid({
  locale,
  dict,
  className = "",
}: {
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-sans text-sm uppercase tracking-wide text-dust">
        {readCopy(dict, "journey.cosmos.heading")}
      </h3>
      <p className="mt-1 mb-4 max-w-[34rem] font-sans text-sm text-dust">
        {readCopy(dict, "journey.cosmos.intro")}
      </p>
      <ul className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/${locale}/explore/${c.slug}`}
              className="block rounded-full border border-[color:var(--line)] px-3 py-1 font-sans text-xs text-dust transition-colors hover:border-amber hover:text-amber"
            >
              {String(getText(dict, c.nameKey) ?? c.slug)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [x] **Step 5: Run to verify it passes**

Run: `bunx vitest run tests/unit/cosmos-grid.test.tsx`
Expected: PASS.

- [x] **Step 6: Render it on the universe stage**

In `JourneyStage.tsx`, after the `PlanetRow` block from Task 3, add:

```tsx
      {stage.id === "universe" ? (
        <CosmosGrid locale={locale} dict={dict} className="mt-8 max-w-[34rem]" />
      ) : null}
```

Add the import `import { CosmosGrid } from "./CosmosGrid";`.

- [x] **Step 7: Add canvas hit-testing and the click handler**

In `src/features/cosmic-journey/scene/scene.ts`, extend the `SceneHandle` type with `hitTest(x: number, y: number): string | null`. Inside `createScene`, keep a module-scoped `let hits: { slug: string; x: number; y: number; r: number }[] = []`, cleared at the start of each `render`. While drawing the eight planets (the `PLANETS` loop, when `plA > 0.01`), push `{ slug: "planet", x: q[0], y: q[1], r: Math.max(pr, 8) }` for each drawn planet. While drawing the nearby stars (the `NEARBY_STARS` loop, when `starA > 0.01`), push `{ slug: "star", x: ns.x * cw, y: ns.y * ch, r: 26 }`. While drawing the galaxy field (when `gwA > 0.01`), push one broad hit at screen centre `{ slug: "galaxy", x: cw / 2, y: ch / 2, r: Math.min(cw, ch) * 0.3 }`. Return from `createScene` an added method:

```ts
    hitTest(x: number, y: number) {
      let best: { slug: string; d: number } | null = null;
      for (const h of hits) {
        const dx = x - h.x;
        const dy = y - h.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= h.r && (!best || d < best.d)) best = { slug: h.slug, d };
      }
      return best ? best.slug : null;
    },
```

In `src/features/cosmic-journey/CosmicJourney.tsx`, add a click handler on the `<canvas>`:

```tsx
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const slug = sceneRef.current?.hitTest(
              event.clientX - rect.left,
              event.clientY - rect.top,
            );
            if (slug) {
              const href = slug === "planet" ? "planet" : slug;
              window.location.assign(`/${locale}/explore/${href}`);
            }
          }}
          className="absolute inset-0 h-full w-full"
        />
```

The canvas stays `aria-hidden`; the `CosmosGrid` and `PlanetRow` are the keyboard path, so a miss on the canvas is harmless.

- [x] **Step 8: Run suite, typecheck, lint, build**

Run: `bunx vitest run ; bun run typecheck ; bun run lint ; bun run build`
Expected: PASS, exit 0.

- [x] **Step 9: Commit**

```bash
git add src/features/cosmic-journey/CosmosGrid.tsx src/features/cosmic-journey/JourneyStage.tsx src/features/cosmic-journey/CosmicJourney.tsx src/features/cosmic-journey/scene/scene.ts src/i18n/en.ts src/i18n/id.ts tests/unit/cosmos-grid.test.tsx
git commit -m "feat: make the Observable Universe a navigable entry point"
```

---

### Task 5: Earth-position facts on the journey

> **Status: DONE** (commit f6766d8, review clean). 174 tests pass, lint 0, typecheck 0, build green.

### Task 5: Earth-position facts on the journey

**Files:**
- Modify: `src/features/cosmic-facts/facts.ts`
- Modify: `src/features/cosmic-journey/stages.ts`
- Modify: `src/i18n/en.ts`, `src/i18n/id.ts`
- Test: `tests/unit/earth-position-facts.test.ts`

**Interfaces:**
- Consumes: `getFact` from `facts.ts`; the earth stage's `factIds` render through `JourneyStage`.
- Produces: two new facts (`milky-way-position`, `milky-way-orbit-time`) with the verified source; the earth stage lists them so they render in the journey's Earth stage (which is the home too).

- [x] **Step 1: Add the facts**

In `src/features/cosmic-facts/facts.ts`, add two entries to `COSMIC_FACTS`, using the exact wording the cited NASA page states:

```ts
  {
    id: "milky-way-position",
    title: "Where the Sun sits in the Milky Way",
    displayValue: "about halfway out",
    summary:
      "Earth is located along one of the Milky Way's spiral arms, about halfway from the centre of the galaxy. The Milky Way is a spiral galaxy whose disk spans more than 100,000 light-years.",
    scaleStage: "galaxy",
    confidenceType: "approximate",
    sourceName: "NASA Science",
    sourceUrl: "https://science.nasa.gov/universe/galaxies/",
    verifiedAt: "<today, YYYY-MM-DD>",
  },
  {
    id: "milky-way-orbit-time",
    title: "One orbit of the Milky Way",
    value: 240000000,
    displayValue: "about 240 million",
    unit: "years",
    summary:
      "The Solar System takes about 240 million years to orbit the Milky Way once.",
    scaleStage: "galaxy",
    confidenceType: "approximate",
    sourceName: "NASA Science",
    sourceUrl: "https://science.nasa.gov/universe/galaxies/",
    verifiedAt: "<today, YYYY-MM-DD>",
  },
```

Set `verifiedAt` to the date the page is re-checked during implementation (today, `YYYY-MM-DD`). Do not add the 26,000 light-year figure or the name "Orion Arm": the cited source does not state them.

- [x] **Step 2: Write the failing test**

```ts
// tests/unit/earth-position-facts.test.ts
import { describe, it, expect } from "vitest";
import { getFact } from "@/features/cosmic-facts/facts";

describe("earth position facts", () => {
  it("carries provenance for the Milky Way position", () => {
    const f = getFact("milky-way-position");
    expect(f).toBeDefined();
    expect(f!.sourceName).toBeTruthy();
    expect(f!.sourceUrl).toBe("https://science.nasa.gov/universe/galaxies/");
    expect(f!.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("states the Milky Way orbit time with a unit", () => {
    const f = getFact("milky-way-orbit-time");
    expect(f).toBeDefined();
    expect(f!.unit).toBe("years");
    expect(f!.displayValue).toMatch(/240 million/);
  });
});
```

- [x] **Step 3: Run to verify it fails, then passes**

Run: `bunx vitest run tests/unit/earth-position-facts.test.ts`
Expected before Step 1's change lands in the file: FAIL (undefined). After Step 1: PASS, 2 tests. Also run `bunx vitest run tests/unit/facts.test.ts` and expect PASS (the registry stays well-formed).

- [x] **Step 4: Surface them on the Earth stage**

In `src/features/cosmic-journey/stages.ts`, add the two ids to the earth stage's `factIds`:

```ts
    factIds: ["earth-diameter", "earth-moon-distance", "milky-way-position", "milky-way-orbit-time"],
```

These render through the existing facts `<details>` in `JourneyStage`, with `DataLabel` and `SourceLink`, so each number keeps its source and date.

- [x] **Step 5: Run suite, typecheck, lint, build**

Run: `bunx vitest run ; bun run typecheck ; bun run lint ; bun run build`
Expected: PASS, exit 0.

- [x] **Step 6: Commit**

```bash
git add src/features/cosmic-facts/facts.ts src/features/cosmic-journey/stages.ts tests/unit/earth-position-facts.test.ts
git commit -m "feat: add Earth's place in the Milky Way to the journey"
```

---

### Task 6: Full gate and live verification

> **Status: DONE** (gate green 174/174, live verified at :3000; commit 445001b for the dead-key cleanup).

### Task 6: Full gate and live verification

**Files:**
- Modify: `docs/runbook.md` only if a fact or behavior note is needed.

- [x] **Step 1: Run the full gate**

```powershell
bunx vitest run
bun run lint
bun run typecheck
bun run build
```

Expected: all pass.

- [x] **Step 2: Live check at port 3000**

Dev server is at http://localhost:3000. Confirm, recording each as evidence:

- No progress bar and no reset control on the journey.
- Scrolling into the Earth stage shows the Moon beside Earth, and the Earth facts list includes the Milky Way position and the 240-million-year orbit, each with a source link.
- The Solar System stage lists the eight planets, each a link; hovering shows its tagline; clicking opens `/explore/planet/<slug>`.
- The Observable Universe stage shows the cosmos grid; each tile links into Explore; clicking a drawn planet/star on the canvas navigates.

- [x] **Step 3: Commit any doc change**

```bash
git add docs/runbook.md
git commit -m "docs: note journey navigation and the Moon"
```

---

## Self-Review

**Spec coverage:**
- Remove progress bar and reset: Task 1.
- Remove the vertical line in the Earth orbit band: Task 2 (the band is deleted, so nothing draws there).
- Show the Moon at the Earth stage: Task 2, Step 6.
- Solar System and Universe stages "not present": Tasks 3 and 4 give them named, linked content; Task 2 restores the original zoom timing so the star and universe scenes read as before.
- Observable Universe interaction, grid plus canvas click: Task 4.
- Earth position content (Milky Way, arm, distance, Sagittarius A*): Task 5. Recorded decision: the cited NASA page states "about halfway from the centre" and "a spiral arm", not "26,000 light-years" or "Orion Arm", so the facts use the sourced wording. Sagittarius A* is not named on that page, so it is not asserted; a follow-up fact can add it with a source that names it.
- Eight planets named, clickable, hoverable: Task 3.
- Home as the same tree as the journey: the Earth facts and the planet row render inside `CosmicJourney` (home), so they appear on home by construction. No separate home file exists.
- Full motion only: every task touches the canvas, the scene, or the full-motion panels; calm keeps its current behaviour except the Task 1 progress-bar removal.

**Recorded conflict:** the earlier plan added the orbit view and the progress bar; the user asked to remove both, so this plan reverts them. Resolved toward the later answer.

**Placeholder scan:** the only angle-bracket items are `verifiedAt: "<today, YYYY-MM-DD>"`, which is a date the implementer fills from the calendar at execution, and the note that a test's accessible-name match may follow the localized name. No code placeholders.

**Type consistency:** `PlanetRow` and `CosmosGrid` both take `{ locale, dict, className }`. `JourneyStage` gains a required `locale: Locale`, forwarded by `CosmicJourney` and by `CalmJourney` (which gains and forwards `locale` through `CalmStage`). `SceneHandle` gains `hitTest(x, y): string | null`. The plan uses `PLANETS` (the actual export in `planets.ts`), not a guessed name.

## Handling the user's local changes

Before any task, run `git status`. The working tree may hold the user's own edits (for example `AGENTS.md`, `docs/APOD-APIs-and-RSS-info.md`). Do not add those files in any commit in this plan; stage only the files each task names.
