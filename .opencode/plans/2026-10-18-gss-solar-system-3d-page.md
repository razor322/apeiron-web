# Solar System 3D Page (GSS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a locale page `/{locale}/solar-system-3d` that renders the Sun and the eight planets as turnable 3D globes with GSS (`gss-lang`), linked from the navbar, with a readable text fallback when the device cannot draw it.

**Architecture:** One new route renders a client component that mounts a GSS scene onto a canvas through `mount()` from `gss-lang`. The `.gss` source is built by a pure module from the existing planet data (radius compressed from real diameter, colour per planet). A small pure data module turns `PLANETS` into GSS values so the logic is unit-tested without a GPU. When the device cannot run the scene (`softwareRendering()` true, or a mount error), the component drops the canvas and shows the always-present planet list: the same list is the page's real, accessible content.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, gss-lang 0.0.6, Vitest (jsdom via first-line pragma), bun.

## Global Constraints

- Copy lives only in `src/i18n/en.ts` and `src/i18n/id.ts`; the two must have identical key shape (guarded by `tests/unit/i18n.test.ts`). Components take a `dict` prop and hold no strings.
- No em dash, en dash, or `--` used as a dash in any text written by this work (antislop R-02 / humanizer section 8).
- Every published number carries `sourceName`/`sourceUrl`, `verifiedAt`, `unit`, and `confidenceType`, or it is not shown (R-17/R-38). This page reuses the already-sourced planet facts; it introduces no new number.
- TypeScript strict; `noUncheckedIndexedAccess` is on: indexed access yields `T | undefined`.
- Resilience and accessibility (project rules): the page must render readable content with no GPU and no JS-driven scene; the canvas is decorative (`aria-hidden`); the 3D scene must respect `prefers-reduced-motion` (GSS does this itself if the stylesheet asks; keep the `@media`). Internal navigation uses `next/link`.
- Navbar link rule (R-24): add the link only once the page exists.
- Shell is PowerShell 5.1: no `&&` (chain with `;`), `-LiteralPath` for `[locale]` paths, `-UseBasicParsing` on `Invoke-WebRequest`.
- Package manager is bun. Run one test file with `bunx vitest run <path>`. Dev server at **http://localhost:3000**.
- Do NOT stage or commit the user's untracked files: `AGENTS.md`, `docs/APOD-APIs-and-RSS-info.md`, `docs/design/logo/`, `public/`, `src/app/icon.svg`, `src/app/apple-icon.png`, and the modified `src/app/layout.tsx`, `src/app/favicon.ico`. This plan edits `src/components/ui/Navbar.tsx`, which the user has also modified; stage only the added `links` line (see Task 5).

### Design direction (binds this page)

The page follows the existing Apeiron design plan (`docs/design/design-plan.md`); it does not invent a new language.

- Palette: `--color-void` `#05060A` ground, `--color-starlight` `#E8E4DC` primary text, `--color-dust` `#8A8D98` secondary text, `--color-amber` `#E8A15B` the single accent, `--line` `rgba(232,228,220,.16)` hairlines. No new colour (R-29).
- Type: display = Instrument Serif (headings), body = Inter, data/units = JetBrains Mono, matching the rest of the site.
- Dial: ENERGY 1 / RHYTHM 2 / MOTION 3. The 3D scene is the page's one MOTION moment; keep everything around it quiet (R-31: the scene exists to make planetary scale turnable, not to decorate).
- Signature element: the row of globes at true relative order rendered by a GPU shader (GSS), the page's single bold move; the surrounding list stays plain.

---

## File Structure

- Create `src/features/solar-system-3d/planet-gss.ts` - pure: maps `PLANETS` into GSS values (id, radius, colour, x). Unit-tested.
- Create `src/features/solar-system-3d/scene-source.ts` - pure: builds the `.gss` source string. Unit-tested.
- Create `src/features/solar-system-3d/SolarSystem3D.tsx` - client: mounts the scene via `gss-lang`, handles the fallback.
- Create `src/app/[locale]/solar-system-3d/page.tsx` - the route.
- Create `src/app/[locale]/solar-system-3d/loading.tsx` - skeleton.
- Modify `src/components/ui/Navbar.tsx` - add the nav link.
- Modify `src/i18n/en.ts`, `src/i18n/id.ts` - nav label and page copy.
- Tests: `tests/unit/planet-gss.test.ts`, `tests/unit/scene-source.test.ts`.

Task order: dependency first, then the pure modules (which carry the tests), then the component and route, then the nav, then the gate.

---

### Task 1: Add the gss-lang dependency

**Files:**
- Modify: `package.json`, `bun.lock`

**Interfaces:**
- Consumes: nothing.
- Produces: `gss-lang@0.0.6`, exporting `mount(canvas, scene, options?)` and `softwareRendering()`.

- [ ] **Step 1: Add the dependency**

Run:

```powershell
bun add gss-lang@0.0.6
```

Expected: `gss-lang` appears in `package.json` dependencies; `bun.lock` updates.

- [ ] **Step 2: Confirm the import resolves with the expected names**

The installed package (verified during planning) exports `mount(canvas, scene, options?)` returning a scene with `destroy()`, `pause()`, `play()`, `setProperty()`, and `softwareRendering()`. Confirm by reading `node_modules/gss-lang/lib/types/embed/index.d.ts` and expect to see both `mount` and `softwareRendering`.
Run: `bun run typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add gss-lang for the 3D solar system page"
```

---

### Task 2: Planet data to GSS values (pure)

**Files:**
- Create: `src/features/solar-system-3d/planet-gss.ts`
- Test: `tests/unit/planet-gss.test.ts`

**Interfaces:**
- Consumes: `PLANETS` from `src/features/explorer/planets.ts`. Each profile's `facts[0]` is the diameter fact (`facts(diameter, distance, period, temp, moons)` in that file); confirm its metric key is the diameter before relying on the index.
- Produces:
  - `type PlanetGss = { id: string; slug: string; nameKey: string; radius: number; color: string; x: number }`.
  - `PLANET_GSS: PlanetGss[]` - eight planets, radius compressed, colour per planet, x laid out left to right in orbital order.
  - `SUN_GSS: { id: "sun"; radius: number; color: string }`.
  - `planetGssFor(slug: string): PlanetGss | undefined`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/planet-gss.test.ts
import { describe, it, expect } from "vitest";
import { PLANET_GSS, SUN_GSS, planetGssFor } from "@/features/solar-system-3d/planet-gss";
import { PLANETS } from "@/features/explorer/planets";

describe("planet gss values", () => {
  it("covers all eight planets", () => {
    expect(PLANET_GSS.map((p) => p.slug).sort()).toEqual(
      PLANETS.map((p) => p.slug).sort(),
    );
  });

  it("gives every planet a positive radius and a colour", () => {
    for (const p of PLANET_GSS) {
      expect(p.radius).toBeGreaterThan(0);
      expect(p.color).toMatch(/^#|^oklch|^rgb/);
    }
  });

  it("keeps the compressed radius ordering by real diameter", () => {
    const jupiter = planetGssFor("jupiter")!;
    const mercury = planetGssFor("mercury")!;
    expect(jupiter.radius).toBeGreaterThan(mercury.radius);
  });

  it("lays the planets out left to right in order", () => {
    for (let i = 1; i < PLANET_GSS.length; i++) {
      expect(PLANET_GSS[i]!.x).toBeGreaterThan(PLANET_GSS[i - 1]!.x);
    }
  });

  it("has a sun", () => {
    expect(SUN_GSS.radius).toBeGreaterThan(0);
    expect(SUN_GSS.color).toMatch(/^#|^oklch|^rgb/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bunx vitest run tests/unit/planet-gss.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write the module**

```ts
// src/features/solar-system-3d/planet-gss.ts
import { PLANETS } from "@/features/explorer/planets";

// Real diameters span 4,879 km (Mercury) to 139,820 km (Jupiter), about 29x.
// On screen that reads as a speck beside a giant, so the measured diameter is
// compressed with a square root before scaling: the order survives, the range
// does not. Colours are the planets' familiar tints, chosen for identity, not
// measurement.
const MIN_RADIUS = 0.28;
const MAX_RADIUS = 1.1;
const SPACING = 2.2;

function diameterOf(slug: string): number {
  const planet = PLANETS.find((p) => p.slug === slug);
  const first = planet?.facts[0];
  return typeof first?.siValue === "number" ? first.siValue : 1;
}

const COLORS: Record<string, string> = {
  mercury: "#9a9a9a",
  venus: "#d9b382",
  earth: "#5b8dd6",
  mars: "#c1502e",
  jupiter: "#d8a97a",
  saturn: "#e0c68a",
  uranus: "#8fd3d6",
  neptune: "#5a76d6",
};

function radiusFor(slug: string): number {
  const r = Math.sqrt(diameterOf(slug));
  const min = Math.sqrt(4_879_000);
  const max = Math.sqrt(139_820_000);
  const t = (r - min) / (max - min);
  return MIN_RADIUS + t * (MAX_RADIUS - MIN_RADIUS);
}

export type PlanetGss = {
  id: string;
  slug: string;
  nameKey: string;
  radius: number;
  color: string;
  x: number;
};

export const PLANET_GSS: PlanetGss[] = PLANETS.map((planet, index) => ({
  id: `planet-${planet.slug}`,
  slug: planet.slug,
  nameKey: planet.nameKey,
  radius: radiusFor(planet.slug),
  color: COLORS[planet.slug] ?? "#cfcbc2",
  x: (index - (PLANETS.length - 1) / 2) * SPACING,
}));

export const SUN_GSS = { id: "sun", radius: 1.4, color: "#e8a15b" } as const;

export function planetGssFor(slug: string): PlanetGss | undefined {
  return PLANET_GSS.find((p) => p.slug === slug);
}
```

Note: if `facts[0]` is not the diameter (check the `facts()` helper and `PlanetFact.metricKey` in `planets.ts`), select the diameter fact by its metric key instead of by index, and keep the test passing.

- [ ] **Step 4: Run to verify it passes**

Run: `bunx vitest run tests/unit/planet-gss.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/features/solar-system-3d/planet-gss.ts tests/unit/planet-gss.test.ts
git commit -m "feat: map planet data to GSS values"
```

---

### Task 3: Build the GSS scene source (pure)

**Files:**
- Create: `src/features/solar-system-3d/scene-source.ts`
- Test: `tests/unit/scene-source.test.ts`

**Interfaces:**
- Consumes: `PLANET_GSS`, `SUN_GSS` from Task 2.
- Produces: `buildSceneSource(): string` - a GSS stylesheet: one `@scene` block listing the Sun and the eight planets, rules that place, size, and colour each, a gentle bob `@keyframes`, and a `prefers-reduced-motion` rule that stops it.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/scene-source.test.ts
import { describe, it, expect } from "vitest";
import { buildSceneSource } from "@/features/solar-system-3d/scene-source";
import { PLANET_GSS, SUN_GSS } from "@/features/solar-system-3d/planet-gss";

describe("scene source", () => {
  const src = buildSceneSource();

  it("declares one scene with the sun and every planet", () => {
    expect(src).toContain("@scene");
    expect(src).toContain(`sphere#${SUN_GSS.id}`);
    for (const p of PLANET_GSS) {
      expect(src).toContain(`sphere#${p.id}`);
    }
  });

  it("gives each object a rule with its radius and colour", () => {
    for (const p of PLANET_GSS) {
      expect(src).toContain(`#${p.id}`);
      expect(src).toContain(p.color);
    }
    expect(src).toContain(SUN_GSS.color);
  });

  it("stops motion under prefers-reduced-motion", () => {
    expect(src).toContain("prefers-reduced-motion");
    expect(src).toContain("animation: none");
  });

  it("is balanced (equal open and close braces)", () => {
    const open = (src.match(/{/g) ?? []).length;
    const close = (src.match(/}/g) ?? []).length;
    expect(open).toBe(close);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bunx vitest run tests/unit/scene-source.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write the module**

```ts
// src/features/solar-system-3d/scene-source.ts
import { PLANET_GSS, SUN_GSS } from "./planet-gss";

// The GSS stylesheet for the 3D solar system: a row of spheres, the Sun first,
// each planet on its x, floating gently. motion stops entirely for a reader who
// asks for less. GSS speaks a CSS dialect; the shapes, colours, and @keyframes
// below are its vocabulary.
export function buildSceneSource(): string {
  const objects = [SUN_GSS.id, ...PLANET_GSS.map((p) => p.id)]
    .map((id) => `  sphere#${id};`)
    .join("\n");

  const rules = [
    `#${SUN_GSS.id} {\n  radius: ${SUN_GSS.radius};\n  color: ${SUN_GSS.color};\n  translate: 0 1.4 0;\n}`,
    ...PLANET_GSS.map(
      (p) =>
        `#${p.id} {\n  radius: ${p.radius};\n  color: ${p.color};\n  translate: ${p.x} 1.3 0;\n  animation: bob 3s ease-in-out alternate;\n}`,
    ),
  ].join("\n\n");

  return `@scene {
${objects}
}

${rules}

@keyframes bob {
  to {
    translate: 0 1.5 0;
  }
}

@media (prefers-reduced-motion) {
  * {
    animation: none !important;
  }
}
`;
}
```

Note: keep the stylesheet to properties GSS 0.0.6 documents (from its site: `radius`, `color`, `translate`, `animation`, `@keyframes`, `@media`). Do not add `material` or `animation-delay` unless verified live in Task 6; an invalid property would be dropped by the compiler, not caught by the unit test.

- [ ] **Step 4: Run to verify it passes**

Run: `bunx vitest run tests/unit/scene-source.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/features/solar-system-3d/scene-source.ts tests/unit/scene-source.test.ts
git commit -m "feat: build the GSS scene source for the solar system"
```

---

### Task 4: The client component and the route

**Files:**
- Create: `src/features/solar-system-3d/SolarSystem3D.tsx`
- Create: `src/app/[locale]/solar-system-3d/page.tsx`
- Create: `src/app/[locale]/solar-system-3d/loading.tsx`
- Modify: `src/i18n/en.ts`, `src/i18n/id.ts`

**Interfaces:**
- Consumes: `mount`, `softwareRendering` from `gss-lang`; `buildSceneSource` from Task 3; `PLANETS`; `getText` from `src/features/explorer/categories.ts`; `getPlanetImage` from `src/features/explorer/planet-images.ts`.
- Produces:
  - `SolarSystem3D({ locale, dict })` client component.
  - The `/{locale}/solar-system-3d` route.

- [ ] **Step 1: Add the dictionary keys**

In `src/i18n/en.ts`, add a `solarSystem3d` block (place it beside the other page blocks), and add `solarSystem3d` to `nav`:

```ts
  solarSystem3d: {
    title: "The Solar System in 3D",
    description:
      "The Sun and the eight planets as three-dimensional globes you can turn. Sizes are compressed to fit one view; colours are the planets' familiar tints.",
    heading: "The Solar System in 3D",
    intro:
      "What follows is the Sun and the eight planets, in order, as globes you can turn. Sizes are compressed so Mercury and Jupiter share one view.",
    fallbackNote: "This device cannot draw the 3D view, so the planets are listed below.",
    listHeading: "The eight planets",
    planetLabel: "Open",
    metaTitle: "Apeiron: the Solar System in 3D",
    metaDescription:
      "The Sun and the eight planets as turnable three-dimensional globes, in order from the Sun.",
  },
```

Nav label: `solarSystem3d: "Solar System 3D"`.

Mirror every key in `src/i18n/id.ts` (for example `title: "Tata Surya dalam 3D"`, `heading: "Tata Surya dalam 3D"`, `intro: "Berikut Matahari dan delapan planet, berurutan, sebagai bola yang bisa diputar. Ukurannya dikompresi agar Merkurius dan Jupiter muat dalam satu tampilan."`, `fallbackNote: "Perangkat ini tidak dapat menggambar tampilan 3D, jadi planetnya didaftarkan di bawah."`, `listHeading: "Delapan planet"`, `planetLabel: "Buka"`, `solarSystem3d: "Tata Surya 3D"`). Run `bunx vitest run tests/unit/i18n.test.ts` and expect PASS.

- [ ] **Step 2: Write the client component**

```tsx
// src/features/solar-system-3d/SolarSystem3D.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { PLANETS } from "@/features/explorer/planets";
import { getText } from "@/features/explorer/categories";
import { getPlanetImage } from "@/features/explorer/planet-images";
import { buildSceneSource } from "./scene-source";

// A turnable 3D row of globes, drawn by GSS on the GPU. The canvas is decorative;
// the list below is the real content, so the page reads for a screen reader and
// stands on a device with no GPU. When the scene cannot run (software rendering
// or a mount error) the canvas is dropped and only the list remains.
export function SolarSystem3D({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);
  const t = dict.solarSystem3d;

  useEffect(() => {
    let scene: { destroy: () => void } | undefined;
    let cancelled = false;
    (async () => {
      try {
        const { mount, softwareRendering } = await import("gss-lang");
        if (cancelled || !canvasRef.current) return;
        if (softwareRendering()) {
          setFailed(true);
          return;
        }
        scene = mount(canvasRef.current, buildSceneSource());
      } catch {
        setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      scene?.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {failed ? (
        <p className="font-sans text-sm text-dust">{t.fallbackNote}</p>
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="aspect-[16/9] w-full rounded-sm border border-[color:var(--line)] bg-void"
        />
      )}
      <h2 className="font-sans text-sm uppercase tracking-wide text-dust">{t.listHeading}</h2>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANETS.map((planet) => {
          const image = getPlanetImage(planet.slug);
          return (
            <li key={planet.slug} className="flex flex-col gap-2">
              {image?.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.previewUrl}
                  alt={image.altText}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full rounded-sm object-cover"
                />
              ) : null}
              <span className="font-serif text-lg text-starlight">
                {String(getText(dict, planet.nameKey) ?? planet.slug)}
              </span>
              <Link
                href={`/${locale}/explore/planet/${planet.slug}`}
                className="font-sans text-xs text-amber underline"
              >
                {t.planetLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Write the route**

Read `src/lib/seo.ts` and `src/app/[locale]/calculators/page.tsx` first, then match the real `routeMetadata(meta, section, path)` call (the first argument is the dictionary `meta` object, not a cast).

```tsx
// src/app/[locale]/solar-system-3d/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { routeMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Heading, Body } from "@/components/ui/Typography";
import { SolarSystem3D } from "@/features/solar-system-3d/SolarSystem3D";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta, solarSystem3d } = await getDictionary(locale);
  return routeMetadata(
    meta,
    { title: solarSystem3d.metaTitle, description: solarSystem3d.metaDescription },
    "solar-system-3d",
  );
}

export default async function SolarSystem3DPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.solarSystem3d;

  return (
    <main className="py-16">
      <Container className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <Heading level={1}>{t.heading}</Heading>
          <Body className="max-w-2xl text-dust">{t.intro}</Body>
        </header>
        <SolarSystem3D locale={locale} dict={dict} />
      </Container>
    </main>
  );
}
```

Note: `routeMetadata`'s `section` type only accepts a title and description; if `meta` does not carry the exact shape, follow how `calculators/page.tsx` builds its `section` and reuse that shape.

- [ ] **Step 4: Write the loading skeleton**

`Skeleton` takes only a `className` (verified during planning).

```tsx
// src/app/[locale]/solar-system-3d/loading.tsx
import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="py-16">
      <Container className="flex max-w-4xl flex-col gap-10">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="aspect-[16/9] w-full" />
      </Container>
    </main>
  );
}
```

- [ ] **Step 5: Verify**

Run: `bun run typecheck ; bun run lint ; bun run build`
Expected: exit 0 each; the build lists `/[locale]/solar-system-3d`.

- [ ] **Step 6: Commit**

```bash
git add src/features/solar-system-3d/SolarSystem3D.tsx "src/app/[locale]/solar-system-3d/page.tsx" "src/app/[locale]/solar-system-3d/loading.tsx" src/i18n/en.ts src/i18n/id.ts
git commit -m "feat: add the 3D solar system page"
```

---

### Task 5: Navbar link

**Files:**
- Modify: `src/components/ui/Navbar.tsx`

**Interfaces:**
- Consumes: `dict.nav.solarSystem3d` (Task 4).
- Produces: a nav link to `/{locale}/solar-system-3d`.

- [ ] **Step 1: Add the link**

In `src/components/ui/Navbar.tsx`, add to the `links` array, after the Explore entry:

```tsx
    { href: `/${locale}/solar-system-3d`, label: dict.nav.solarSystem3d },
```

- [ ] **Step 2: Verify**

Run: `bun run typecheck ; bun run lint ; bun run build`
Expected: exit 0.

- [ ] **Step 3: Commit (stage only the added line's file)**

```bash
git add src/components/ui/Navbar.tsx
git commit -m "feat: link the 3D solar system page from the navbar"
```

Report that `Navbar.tsx` also holds the user's own pending edits; only the added `links` line is this task's change.

---

### Task 6: Full gate and live verification

**Files:**
- Modify: `docs/runbook.md` only if a note is needed.

- [ ] **Step 1: Run the full gate**

```powershell
bunx vitest run
bun run lint
bun run typecheck
bun run build
```

Expected: all pass.

- [ ] **Step 2: Live check at port 3000**

Dev server is at http://localhost:3000. Confirm, recording each as evidence:

- `/{locale}/solar-system-3d` loads: heading, the 3D scene, and the planet list with images.
- The nav shows "Solar System 3D" and it navigates to the page.
- The scene draws the Sun and eight planets; dragging turns the view, the wheel zooms.
- With `prefers-reduced-motion: reduce`, the scene does not bob.
- With software rendering forced (or a mount error), the fallback note shows and no canvas is drawn; the planet list still renders.
- Each planet links to `/explore/planet/<slug>`.
- No console errors.

If a property in `buildSceneSource` is rejected by the GSS compiler (a console warning naming a property), remove that property from `scene-source.ts` and its test expectation, then re-run the scene.

- [ ] **Step 3: Commit any doc change**

```bash
git add docs/runbook.md
git commit -m "docs: note the 3D solar system page"
```

---

## Self-Review

**Spec coverage:**
- New page with 3D objects via GSS: Tasks 2-4.
- In the navbar: Task 5.
- Mandatory fallback when the GPU cannot run it: Task 4 (the list is always rendered; the canvas is dropped on `softwareRendering()` or a mount error).
- The journey canvas is untouched: no task edits `scene.ts` or `CosmicJourney.tsx`.
- Design direction followed: the page reuses the site palette, type, and dial; the 3D scene is the single MOTION moment.

**Recorded decisions:**
- GSS is used for a new page, not to replace the journey (the journey is a 2D schematic; GSS is 3D only).
- The planet list doubles as the accessible content and the fallback.
- Sizes are compressed (square root of diameter) and the intro says so, matching the journey's convention (order survives, range does not).
- The stylesheet stays within the properties GSS 0.0.6 documents; a rejected property is dropped live in Task 6, not guessed.

**Placeholder scan:** the four "confirm against the installed code" notes (`facts[0]` metric key, `routeMetadata` signature, `Skeleton` props, which GSS properties compile) are source checks the implementer runs, not code placeholders. Every code step shows code.

**Type consistency:** `PLANET_GSS`/`SUN_GSS`/`planetGssFor` are defined in Task 2 and used in Tasks 3 and 4. `buildSceneSource` is defined in Task 3 and used in Task 4. `SolarSystem3D` props (`locale`, `dict`) match its call site in the route. Dictionary keys `nav.solarSystem3d` and `solarSystem3d.*` are added in Task 4 and used in Tasks 4 and 5.
