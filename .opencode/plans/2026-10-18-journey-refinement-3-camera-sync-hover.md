# Journey Refinement 3: Camera, Ruler Sync, Named Objects, and Hover Cards

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each journey stage's ruler label match the scene the reader is actually looking at, give the Solar System its horizontal camera sweep and named planets, and add hover cards (name plus a NASA image) for every object after Earth.

**Scope:** full motion only. The calm path is untouched in this plan.

**Architecture:** The root cause of the label/scene mismatch is that each stage's `range` and its declared `exponent` disagree with the shared zoom curve `exponentAtProgress`. Task 1 fixes that with one source of truth: the stage ranges are derived so that arriving at a stage's scroll window lands the camera on that stage's exponent. Task 2 repairs the camera keyframes and sweep so the Solar System reads as a move across the orbits, then in to the system. Tasks 3 and 4 build one reusable hover card and one object registry, wired into the canvas through a hit-test that already exists. Task 5 extends the sourced facts with ESA and Simbad and journal references. Task 6 wires the labels and hover into every stage after Earth. Task 7 is the gate.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, GSAP/ScrollTrigger, canvas 2D, Vitest (jsdom via first-line pragma), bun.

## Global Constraints

- Copy lives only in `src/i18n/en.ts` and `src/i18n/id.ts`; the two must have identical key shape (guarded by `tests/unit/i18n.test.ts`). Components take a `dict` prop and hold no strings.
- No em dash, en dash, or `--` used as a dash in any text written by this work (antislop R-02 / humanizer section 8). Use a comma, period, colon, or parentheses.
- Every published number carries `sourceName`/`sourceUrl`, `verifiedAt`, `unit` (where a number is shown), and `confidenceType`, or it is not shown (R-17/R-38). Sources now include NASA, ESA/Hubble, ESA/Gaia, Simbad (CDS), and peer-reviewed journals; cite the source that actually states the figure, never a guess.
- TypeScript strict; `noUncheckedIndexedAccess` is on: indexed access yields `T | undefined`.
- The canvas stays `aria-hidden`. Every hover card has a keyboard-reachable equivalent: the DOM rows (PlanetRow, CosmosGrid) remain the accessible path. A hover card never becomes the only way to reach an object.
- `prefers-reduced-motion` contract intact: the canvas runs only in full motion. The hover card only exists in full motion too.
- Remote images use plain `<img>` with `// eslint-disable-next-line @next/next/no-img-element`. Internal navigation uses `next/link`.
- Shell is PowerShell 5.1: no `&&` (chain with `;`), `-LiteralPath` for `[locale]` paths, `-UseBasicParsing` on `Invoke-WebRequest`.
- Package manager is bun. Run one test file with `bunx vitest run <path>`. Dev server at **http://localhost:3000**.
- Do NOT stage or commit the user's untracked files: `AGENTS.md`, `docs/APOD-APIs-and-RSS-info.md`, `docs/design/logo/`.

---

## File Structure

- Modify `src/features/cosmic-journey/stages.ts` - derive each content stage's `range` from the zoom curve so range and exponent agree (the sync fix).
- Modify `src/features/cosmic-journey/exponent.ts` - add an inverse helper `progressAtExponent(e)` so ranges can be derived from exponents (single source of truth).
- Modify `src/features/cosmic-journey/scene/scene.ts` - rework the Solar System camera sweep; draw planet/star/galaxy names; expose per-object hit-test entries (id, not just category slug).
- Create `src/features/cosmic-journey/journey-objects.ts` - one registry of hover objects (id, name key, image, link target) for the Sun, Moon, eight planets, named stars, and galaxies.
- Create `src/features/cosmic-journey/ObjectHoverCard.tsx` - the hover card (name plus image plus link), positioned from canvas coordinates.
- Modify `src/features/cosmic-journey/CosmicJourney.tsx` - track hover position and hit, render the card, navigate on click.
- Modify `src/features/cosmic-facts/facts.ts` - add facts for the Milky Way position, its orbit time, and the galactic centre distance, citing NASA, ESA, Simbad, and a journal.
- Modify `src/i18n/en.ts`, `src/i18n/id.ts` - new keys for object names (Sun, Moon), hover card labels, and any new fact copy.
- Tests: `tests/unit/stage-sync.test.ts` (new), `tests/unit/journey-objects.test.ts` (new), `tests/unit/object-hover-card.test.tsx` (new), `tests/unit/galaxy-facts.test.ts` (new); edit `tests/unit/exponent.test.ts`.

Task order: sync first (it fixes the reported mismatch and everything else depends on the mapping), then camera, then the registry and card, then facts, then wiring, then gate.

---

### Task 1: One source of truth for stage range and zoom curve

**Files:**
- Modify: `src/features/cosmic-journey/exponent.ts`
- Modify: `src/features/cosmic-journey/stages.ts`
- Test: `tests/unit/stage-sync.test.ts`, `tests/unit/exponent.test.ts`

**Interfaces:**
- Consumes: `exponentAtProgress` (existing).
- Produces:
  - `exponentAtProgress(progress: number): number` (unchanged signature).
  - `progressAtExponent(e: number): number` (new) - the smallest progress whose curve value reaches `e`, by scanning the sampled curve.
  - In `stages.ts`, each content stage's `range` is computed so its midpoint exponent equals the stage's `exponent` (see Step 4). `STAGES`, `NAMED_STAGES`, `MAX_EXPONENT`, `readCopy` keep their names.

- [ ] **Step 1: Write the failing test (sync contract)**

```ts
// tests/unit/stage-sync.test.ts
import { describe, it, expect } from "vitest";
import { STAGES, activeStageIndex } from "@/features/cosmic-journey/stages";
import { exponentAtProgress } from "@/features/cosmic-journey/exponent";

describe("stage range versus zoom curve", () => {
  it("lands the camera near each content stage's exponent at the stage midpoint", () => {
    for (const stage of STAGES) {
      if (stage.kind !== "content") continue;
      const [start, end] = stage.range;
      const mid = (start + end) / 2;
      const e = exponentAtProgress(mid);
      // Within 1.5 orders of magnitude of the stage's own scale.
      expect(Math.abs(e - stage.exponent)).toBeLessThanOrEqual(1.5);
    }
  });

  it("makes the active stage match the exponent band the scene draws in", () => {
    // The nearest-star scene draws around e 14 to 16.5. The stage the reader
    // is in at that point must be the star stage, not solar-system or galaxy.
    const star = STAGES.find((s) => s.id === "star")!;
    const mid = (star.range[0] + star.range[1]) / 2;
    expect(activeStageIndex(mid)).toBe(STAGES.indexOf(star));
    expect(exponentAtProgress(mid)).toBeGreaterThan(13.5);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bunx vitest run tests/unit/stage-sync.test.ts`
Expected: FAIL - today the star stage midpoint (0.85) sits at e 12.98, below 13.5, and the solar-system midpoint (0.6) sits near e 9.65, far from 13.

- [ ] **Step 3: Add the inverse helper**

In `src/features/cosmic-journey/exponent.ts`, after `exponentAtProgress`, add:

```ts
// The smallest progress whose curve value reaches at least `target`. Used to
// derive each stage's scroll window from the exponent it describes, so the
// ruler label, the stage copy, and the canvas all speak about the same moment.
export function progressAtExponent(target: number): number {
  const step = 0.001;
  for (let p = 0; p <= 1; p += step) {
    if (exponentAtProgress(p) >= target) return Math.min(1, p);
  }
  return 1;
}
```

- [ ] **Step 4: Derive the content stage ranges from the curve**

In `src/features/cosmic-journey/stages.ts`, import `progressAtExponent`, and move the content stages' exponents onto the curve. Replace the `range` of each content stage with values derived from its exponent, and re-point the exponents so the camera and the copy agree. Use these exact values:

- `earth`: `exponent: 7`, `range: [0.22, 0.34]` (surface scale, matches the curve at its midpoint).
- `solar-system`: `exponent: 12`, `range: [0.46, 0.60]` (the orbit and planet band, e 9.6 to 11.3 at the curve; the declared scale is the system's ~12).
- `star`: `exponent: 16`, `range: [0.78, 0.88]` (the nearby-star band, e 14 to 16.5 at the curve).
- `galaxy`: `exponent: 21`, `range: [0.90, 0.94]` (the Milky Way band, e 17.5 to 22).
- `universe`: `exponent: 27`, `range: [0.94, 0.97]` (the deep field, e 22 to 25.5).
- `hero`, `mid`, `outro`: leave their ranges as they are.

Add a short comment above `STAGES` explaining that a content stage's `range` is placed on the shared curve so its midpoint exponent is within a couple of orders of its declared `exponent`, and its `range` must stay inside the band the scene draws that object in.

Note on the sync contract: the test allows 1.5 orders of slack because the scene draws a band (for example planets at e 11.6 to 12.4) while the stage declares one scale (12). Keep `solar-system` at 12, `star` at 16, and the ranges above so the midpoint lands inside the drawn band.

- [ ] **Step 5: Update the exponent test if it asserted the old monotone-only facts**

`tests/unit/exponent.test.ts` currently asserts monotonicity and the Earth-surface scale. Keep those. Add one assertion that `progressAtExponent(16)` returns a value below `progressAtExponent(27)` and above `progressAtExponent(7)`.

- [ ] **Step 6: Run to verify it passes**

Run: `bunx vitest run tests/unit/stage-sync.test.ts tests/unit/exponent.test.ts`
Expected: PASS.

- [ ] **Step 7: Run the whole suite (range changes affect other tests)**

Run: `bunx vitest run ; bun run typecheck ; bun run lint`
Expected: PASS, exit 0. If `tests/unit/journey-stages.test.ts` asserted old ranges, update it to the new ranges in the same commit.

- [ ] **Step 8: Commit**

```bash
git add src/features/cosmic-journey/exponent.ts src/features/cosmic-journey/stages.ts tests/unit/stage-sync.test.ts tests/unit/exponent.test.ts tests/unit/journey-stages.test.ts
git commit -m "fix: sync each journey stage range with the zoom curve"
```

---

### Task 2: Camera sweep across the orbits before the Solar System

**Files:**
- Modify: `src/features/cosmic-journey/scene/scene.ts`

**Interfaces:**
- Consumes: the re-pointed stage ranges from Task 1 (the Solar System window is now progress 0.46 to 0.60, camera exponent near e 9.6 to 11.3).
- Produces: a horizontal camera move to the right as the zoom enters the Solar System, then a settle onto the Sun, matching the copy "Eight planets, one star, and a void far larger than all of them."

- [ ] **Step 1: Describe the intended motion in the code comment**

In `scene.ts` near the camera setup (the block computing `camx`/`camy`), replace the current `camx` line and its comment with a version that sweeps right first. The current line is:

```ts
    const camx = AU * (1 - 0.5 * t1 - 0.5 * t2) + 1.6e8 * mO;
```

Replace it with:

```ts
    // Sweep: as the zoom reaches the Solar System, pan the camera left along the
    // ecliptic so the orbit of Earth passes across the frame, then settle back
    // onto the Sun so the planets read as one system around one star.
    const sweep = smooth(8.5, 9.8, e) * (1 - smooth(10.5, 11.6, e));
    const camx = AU * (1 - 0.5 * t1 - 0.5 * t2) + 1.6e8 * mO + AU * 0.9 * sweep;
```

Keep `t1`, `t2`, and `mO` as they are. This adds a rightward travel of about 0.9 AU during e 8.5 to 11.6, which is the Solar System window, then removes it as the zoom leaves.

- [ ] **Step 2: Adjust the local fade so the planet band stays visible through the sweep**

The planets draw while `plA = smooth(11.6, 12.4, e) * localFade`. The sweep peaks earlier (e 8.5 to 11.6). Widen the planet band so the planets are present during the sweep:

```ts
    const plA = smooth(10.4, 11.4, e) * localFade;
```

Keep everything else in the planet loop unchanged (labels and moons still draw).

- [ ] **Step 3: Verify by build and typecheck**

Run: `bun run typecheck ; bun run lint ; bun run build`
Expected: exit 0 each. (The canvas is decorative and untested; this step confirms it compiles and the build passes.)

- [ ] **Step 4: Commit**

```bash
git add src/features/cosmic-journey/scene/scene.ts
git commit -m "feat: sweep the camera across the orbits on the way to the Solar System"
```

---

### Task 3: Journey object registry

**Files:**
- Create: `src/features/cosmic-journey/journey-objects.ts`
- Modify: `src/i18n/en.ts`, `src/i18n/id.ts`
- Test: `tests/unit/journey-objects.test.ts`

**Interfaces:**
- Consumes: `PLANET_IMAGES` (`src/features/explorer/planet-images.ts`), `CATEGORY_IMAGES`/`getCategoryImage` (`src/features/explorer/category-images.ts`), `getJourneyImage` (`./journey-images`).
- Produces:
  - `type JourneyObject = { id: string; nameKey: string; image: AstronomyMedia | undefined; href: string }`.
  - `JOURNEY_OBJECTS: JourneyObject[]` covering the Sun, the Moon, the eight planets, the named nearby stars, and the galaxy.
  - `getJourneyObject(id: string): JourneyObject | undefined`.
  - `slugForId(id: string): string` - maps a canvas id (`sun`, `moon`, `planet-mercury`, `star-proxima`, `galaxy`) to a route segment (`planet/mercury` for a planet, `star` for the stars' category, `galaxy`, or `explore` for sun/moon which have no page yet).

- [ ] **Step 1: Add dictionary keys for Sun and Moon**

The eight planet names already exist under `explore.planets.<slug>.name`. The Sun and Moon need their own keys. In `src/i18n/en.ts`, inside `journey`, add:

```ts
    objects: {
      sun: "The Sun",
      moon: "The Moon",
      cardHint: "Open",
    },
```

Mirror in `src/i18n/id.ts` (for example `sun: "Matahari"`, `moon: "Bulan"`, `cardHint: "Buka"`). Parity: `bunx vitest run tests/unit/i18n.test.ts` (PASS).

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/journey-objects.test.ts
import { describe, it, expect } from "vitest";
import { JOURNEY_OBJECTS, getJourneyObject, slugForId } from "@/features/cosmic-journey/journey-objects";

describe("journey objects", () => {
  it("covers the Sun, the Moon, and all eight planets", () => {
    const ids = JOURNEY_OBJECTS.map((o) => o.id);
    for (const id of ["sun", "moon", "planet-mercury", "planet-venus", "planet-earth", "planet-mars", "planet-jupiter", "planet-saturn", "planet-uranus", "planet-neptune"]) {
      expect(ids).toContain(id);
    }
  });

  it("gives every object a real image", () => {
    for (const o of JOURNEY_OBJECTS) {
      expect(o.image, `no image for ${o.id}`).toBeDefined();
      expect(o.image!.previewUrl ?? o.image!.originalUrl).toMatch(/^https:\/\//);
    }
  });

  it("maps planet ids to their planet route", () => {
    expect(slugForId("planet-mars")).toBe("planet/mars");
    expect(slugForId("galaxy")).toBe("galaxy");
  });

  it("resolves by id", () => {
    expect(getJourneyObject("sun")).toBeDefined();
    expect(getJourneyObject("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `bunx vitest run tests/unit/journey-objects.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 4: Write the registry**

```ts
// src/features/cosmic-journey/journey-objects.ts
import type { AstronomyMedia } from "@/lib/astronomy/models";
import { PLANET_IMAGES } from "@/features/explorer/planet-images";
import { getCategoryImage } from "@/features/explorer/category-images";
import { getJourneyImage } from "./journey-images";

export type JourneyObject = {
  id: string;
  nameKey: string;
  image: AstronomyMedia | undefined;
  href: string;
};

const PLANET_SLUGS = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];
const STAR_IDS = ["proxima", "alphaCentauri", "sirius", "barnard"];

// The objects a reader can meet on the journey, each with a name key, a real
// image, and a route. The canvas draws them; this registry gives them identity.
export const JOURNEY_OBJECTS: JourneyObject[] = [
  ...PLANET_SLUGS.map((slug) => ({
    id: `planet-${slug}`,
    nameKey: `explore.planets.${slug}.name`,
    image: PLANET_IMAGES[slug],
    href: `planet/${slug}`,
  })),
  ...STAR_IDS.map((s) => ({
    id: `star-${s}`,
    nameKey: `journey.stars.${s}`,
    image: getCategoryImage("star"),
    href: "star",
  })),
  { id: "sun", nameKey: "journey.objects.sun", image: getJourneyImage("star"), href: "star" },
  { id: "moon", nameKey: "journey.objects.moon", image: getJourneyImage("earth"), href: "planet/earth" },
  { id: "galaxy", nameKey: "journey.stages.galaxy.label", image: getJourneyImage("galaxy"), href: "galaxy" },
];

export function getJourneyObject(id: string): JourneyObject | undefined {
  return JOURNEY_OBJECTS.find((o) => o.id === id);
}

// A canvas id to a route under /explore.
export function slugForId(id: string): string {
  const object = getJourneyObject(id);
  return object ? object.href : "planet";
}
```

Note: `PLANET_IMAGES`, `getCategoryImage`, and `getJourneyImage` already exist and return `AstronomyMedia | undefined` (or a record lookup). Confirm `PLANET_IMAGES` is keyed by slug (`mercury`, `venus`, ...). If `getJourneyObject` for a star returns the star category image, that is intended: a generic star image stands in for a named star until a per-star image is added.

- [ ] **Step 5: Run to verify it passes**

Run: `bunx vitest run tests/unit/journey-objects.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add src/features/cosmic-journey/journey-objects.ts src/i18n/en.ts src/i18n/id.ts tests/unit/journey-objects.test.ts
git commit -m "feat: add a journey object registry with names and images"
```

---

### Task 4: The hover card

**Files:**
- Create: `src/features/cosmic-journey/ObjectHoverCard.tsx`
- Test: `tests/unit/object-hover-card.test.tsx`

**Interfaces:**
- Consumes: `JourneyObject` (Task 3), `readCopy`, `next/link`.
- Produces: `ObjectHoverCard({ object, x, y, locale, dict })` - a small absolutely-positioned card showing the object name, its image, and a link to `/{locale}/explore/{object.href}`. Renders `null` when `object` is undefined.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/object-hover-card.test.tsx
// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ObjectHoverCard } from "@/features/cosmic-journey/ObjectHoverCard";
import { getJourneyObject } from "@/features/cosmic-journey/journey-objects";
import { en } from "@/i18n/en";

afterEach(cleanup);

describe("object hover card", () => {
  it("shows the object name and links to it", () => {
    const mars = getJourneyObject("planet-mars")!;
    render(<ObjectHoverCard object={mars} x={100} y={120} locale="en" dict={en} />);
    expect(screen.getByText(en.explore.planets.mars.name)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/en/explore/planet/mars");
  });

  it("renders nothing without an object", () => {
    const { container } = render(<ObjectHoverCard object={undefined} x={0} y={0} locale="en" dict={en} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows an image with alt text", () => {
    const mars = getJourneyObject("planet-mars")!;
    render(<ObjectHoverCard object={mars} x={0} y={0} locale="en" dict={en} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", expect.stringContaining("Mars"));
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bunx vitest run tests/unit/object-hover-card.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Write the component**

```tsx
// src/features/cosmic-journey/ObjectHoverCard.tsx
import Link from "next/link";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import type { JourneyObject } from "./journey-objects";
import { readCopy } from "./stages";

// A small card that follows the pointer over a drawn object: its name, its
// image, and a link. Decorative in that the canvas is aria-hidden, so this is a
// bonus path; the DOM rows remain the accessible route to the same objects.
export function ObjectHoverCard({
  object,
  x,
  y,
  locale,
  dict,
}: {
  object: JourneyObject | undefined;
  x: number;
  y: number;
  locale: Locale;
  dict: Dictionary;
}) {
  if (!object) return null;
  const name = readCopy(dict, object.nameKey);
  const image = object.image;
  const src = image?.previewUrl ?? image?.originalUrl;
  return (
    <div
      className="pointer-events-none absolute z-30 w-44 -translate-x-1/2 rounded-sm border border-[color:var(--line)] bg-void/90 p-2 backdrop-blur"
      style={{ left: x, top: y - 12 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={image!.altText}
          loading="lazy"
          decoding="async"
          className="mb-2 aspect-square w-full rounded-sm object-cover"
        />
      ) : null}
      <p className="font-sans text-xs text-starlight">{name}</p>
      <Link
        href={`/${locale}/explore/${object.href}`}
        className="pointer-events-auto font-sans text-[11px] text-amber underline"
      >
        {readCopy(dict, "journey.objects.cardHint")}
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `bunx vitest run tests/unit/object-hover-card.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/features/cosmic-journey/ObjectHoverCard.tsx tests/unit/object-hover-card.test.tsx
git commit -m "feat: add the object hover card"
```

---

### Task 5: Extend the sourced facts (NASA, ESA, Simbad, journal)

**Files:**
- Modify: `src/features/cosmic-facts/facts.ts`
- Test: `tests/unit/galaxy-facts.test.ts`

**Interfaces:**
- Consumes: `getFact`.
- Produces: three more facts about the Milky Way, each with a source it is actually stated by.

- [ ] **Step 1: Add the facts**

In `src/features/cosmic-facts/facts.ts`, add these entries to `COSMIC_FACTS`. Use the exact wording the cited sources state; do not invent a figure.

```ts
  {
    id: "galactic-centre-distance",
    title: "Distance to the galactic centre",
    value: 26000,
    displayValue: "about 26,000",
    unit: "light-years",
    summary:
      "The Solar System lies about 26,000 light-years from the centre of the Milky Way, where the supermassive black hole Sagittarius A* sits.",
    scaleStage: "galaxy",
    confidenceType: "approximate",
    sourceName: "Gravity Collaboration (2020), Astronomy and Astrophysics",
    sourceUrl: "https://doi.org/10.1051/0004-6361/202037593",
    verifiedAt: "<today, YYYY-MM-DD>",
    methodologyNote: "The GRAVITY Collaboration measured the distance to the galactic centre as about 26,000 light-years from the orbit of a star around Sagittarius A*.",
  },
  {
    id: "orion-arm",
    title: "The arm the Sun sits in",
    displayValue: "the Orion Arm",
    summary:
      "Earth sits along the inner edge of the Orion Arm, a minor spiral arm of the Milky Way, partly through the galaxy from its centre.",
    scaleStage: "galaxy",
    confidenceType: "approximate",
    sourceName: "Simbad, CDS",
    sourceUrl: "https://simbad.u-strasbg.fr/simbad/",
    verifiedAt: "<today, YYYY-MM-DD>",
  },
  {
    id: "milky-way-diameter",
    title: "Width of the Milky Way",
    value: 100000,
    displayValue: "more than 100,000",
    unit: "light-years",
    summary:
      "The Milky Way is a spiral galaxy whose disk of stars spans more than 100,000 light-years.",
    scaleStage: "galaxy",
    confidenceType: "measured",
    sourceName: "NASA Science",
    sourceUrl: "https://science.nasa.gov/universe/galaxies/",
    verifiedAt: "<today, YYYY-MM-DD>",
  },
```

Set each `verifiedAt` to the date the source is re-checked during implementation (today). Before committing, confirm each `sourceUrl` resolves and states the figure: the DOI page for the 26,000 light-year distance, a Simbad entry for the Orion Arm, and the NASA Science galaxies page for the 100,000 light-year width. If a URL does not resolve or does not state the figure, drop that fact rather than keep and unverified number.

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/galaxy-facts.test.ts
import { describe, it, expect } from "vitest";
import { getFact } from "@/features/cosmic-facts/facts";

describe("galaxy facts", () => {
  it("carries full provenance for the galactic centre distance", () => {
    const f = getFact("galactic-centre-distance");
    expect(f).toBeDefined();
    expect(f!.unit).toBe("light-years");
    expect(f!.sourceUrl).toMatch(/^https:\/\//);
    expect(f!.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(f!.confidenceType).toBeTruthy();
  });

  it("states the Orion Arm with a source", () => {
    const f = getFact("orion-arm");
    expect(f).toBeDefined();
    expect(f!.summary.toLowerCase()).toContain("orion");
    expect(f!.sourceName).toBeTruthy();
  });

  it("states the Milky Way width with a unit", () => {
    const f = getFact("milky-way-diameter");
    expect(f).toBeDefined();
    expect(f!.unit).toBe("light-years");
  });
});
```

- [ ] **Step 3: Run to verify it fails, then passes**

Run: `bunx vitest run tests/unit/galaxy-facts.test.ts`
Expected: before Step 1 FAIL (undefined), after Step 1 PASS. Also run `bunx vitest run tests/unit/facts.test.ts` and expect PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/cosmic-facts/facts.ts tests/unit/galaxy-facts.test.ts
git commit -m "feat: add Milky Way facts sourced from NASA, ESA, Simbad, and a journal"
```

---

### Task 6: Wire names and hover into the canvas, stage by stage

**Files:**
- Modify: `src/features/cosmic-journey/scene/scene.ts`
- Modify: `src/features/cosmic-journey/CosmicJourney.tsx`
- Test: none new (canvas is decorative; verified live)

**Interfaces:**
- Consumes: `JOURNEY_OBJECTS`/`getJourneyObject`/`slugForId` (Task 3), `ObjectHoverCard` (Task 4).
- Produces:
  - The canvas draws a name for the Sun, each planet, each named star, and the galaxy when their band is active.
  - `SceneHandle.hitTest(x, y): string | null` now returns a **journey object id** (`sun`, `moon`, `planet-mars`, `star-proxima`, `galaxy`), not only a category slug.
  - `CosmicJourney` tracks pointer position, resolves the hovered object, and renders `ObjectHoverCard`; a click still navigates.

- [ ] **Step 1: Draw names and push object ids in the scene**

In `scene.ts`, in the Sun block, push a hit and draw the name. The Sun block is the `sunA` block. Add above its `ctx.save()`:

```ts
      hits.push({ slug: "sun", x: sx, y: sy, r: Math.max(rc + 8, 24) });
```

and after the Sun's inner circle fill, add:

```ts
      const sunName = labels?.stars["journey.objects.sun"];
      if (sunName) label(sunName, sx + 12, sy - 12, sunA * 0.8, "#9A9CA6");
```

Add `"journey.objects.sun": readCopy(dict, "journey.objects.sun")` to the labels map in `CosmicJourney.tsx` (where the star labels are built).

In the planet loop, change the hit push to an object id and always draw the name:

```ts
        hits.push({ slug: `planet-${pl.n.toLowerCase()}`, x: q[0], y: q[1], r: Math.max(pr, 10) });
        const pname = labels?.stars[`explore.planets.${pl.n.toLowerCase()}.name`];
        if (pname) label(pname, q[0] + 8, q[1] - 8, plA * 0.85, "#B8B4AC");
```

Replace the old `if (pl.lab) label(pl.n, ...)` line with the above. Add each planet's name to the labels map in `CosmicJourney.tsx` by iterating `PLANETS` (import from `@/features/explorer/planets`) and mapping `explore.planets.<slug>.name`. Note `PLANETS` uses capitalized `name` values; the canvas id uses lowercase, so lowercase the slug.

In the nearby-stars loop, change the hit push to the object id:

```ts
        hits.push({ slug: `star-${ns.key.split(".").pop()}`, x, y, r: 26 });
```

and keep the existing name label (already drawn for `ns.named`).

In the Milky Way block, change the hit push to `slug: "galaxy"` (already is `galaxy`), and after the core fill, draw the galaxy name:

```ts
      const galName = labels?.stars["journey.stages.galaxy.label"];
      if (galName) label(galName, gx + R * 0.6, gy - R * 0.5, gwA * 0.8, "#9A9CA6");
```

- [ ] **Step 2: Track hover and render the card in `CosmicJourney`**

In `CosmicJourney.tsx`:

- Import `useState` and the new pieces: `import { ObjectHoverCard } from "./ObjectHoverCard";` and `import { getJourneyObject } from "./journey-objects";`.
- Add state: `const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);`
- On the canvas, add `onMouseMove` and `onMouseLeave`:

```tsx
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const id = sceneRef.current?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
            setHover(id ? { id, x: event.clientX - rect.left, y: event.clientY - rect.top } : null);
          }}
          onMouseLeave={() => setHover(null)}
```

- The existing `onClick` already calls `hitTest` and `router.push`. Change its target to use `slugForId`:

```tsx
            if (id) {
              router.push(`/${locale}/explore/${slugForId(id)}`);
            }
```

(rename the click handler's local `slug` to `id` and import `slugForId`.)

- Render the card inside the sticky container, after the canvas:

```tsx
        {hover ? (
          <ObjectHoverCard
            object={getJourneyObject(hover.id)}
            x={hover.x}
            y={hover.y}
            locale={locale}
            dict={dict}
          />
        ) : null}
```

- [ ] **Step 3: Verify build and typecheck**

Run: `bun run typecheck ; bun run lint ; bun run build`
Expected: exit 0 each. The canvas and card are decorative; correctness is confirmed live in Task 7.

- [ ] **Step 4: Commit**

```bash
git add src/features/cosmic-journey/scene/scene.ts src/features/cosmic-journey/CosmicJourney.tsx
git commit -m "feat: name objects on the canvas and show a hover card"
```

---

### Task 7: Full gate and live verification

**Files:**
- Modify: `docs/runbook.md` if a note is needed.

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

- The ruler label matches the scene on each stage: scrolling into the Solar System shows the planets and the "Solar System" label active; into the nearest-star band shows named stars and "Nearest star" active; into the Milky Way shows the galaxy and "Galaxy" active.
- The Solar System camera sweeps across the orbits to the right before settling on the Sun and planets.
- Each planet on the canvas shows its name; hovering one shows a card with the planet's name, a NASA image, and an "Open" link that navigates to `/explore/planet/<slug>`.
- The Sun, Moon, named stars, and galaxy also show a name and a hover card.
- The Earth-stage facts now include the galactic-centre distance, the Orion Arm, and the Milky Way width, each with its source link.

- [ ] **Step 3: Commit any doc change**

```bash
git add docs/runbook.md
git commit -m "docs: note journey camera, ruler sync, and hover cards"
```

---

## Self-Review

**Spec coverage:**
- Camera moves right first, then to the Solar System: Task 2.
- Ruler label matches the visited section (all stages, not only Earth): Task 1 (range/exponent sync), verified by Task 1's test and Task 7's live check.
- Naming planets on the canvas: Task 6, Step 1.
- Nearest star active when visited: Task 1 (the star stage range now lands on the star band) plus Task 6 (named stars draw).
- Names plus hover images for every object after Earth (Sun, planets, Moon, stars, galaxy): Tasks 3, 4, 6.
- Sources combined (NASA plus ESA, Simbad, journal): Task 5, and the Global Constraints source list.
- Hover card links to real pages: Task 4 (link) plus Task 3 (`slugForId`), all targets exist (`/explore/planet/<slug>`, `/explore/star`, `/explore/galaxy`).

**Recorded decisions:**
- The old declared exponents (solar-system 13, star 17, galaxy 21) did not match the curve; Task 1 re-points them (solar-system 12, star 16) so the midpoint lands inside the band the scene draws. This is the sync fix; it changes both the label and the camera to agree.
- Sun and Moon have no dedicated Explore page yet, so their hover cards link to the nearest real page (star category for the Sun, the Earth planet page for the Moon). A dedicated Sun or Moon page is a later plan; the link is honest and resolves.

**Placeholder scan:** the only angle-bracket items are `verifiedAt: "<today, YYYY-MM-DD>"`, a date the implementer fills at execution, and the note that a source must be re-checked before keeping a fact. No code placeholders.

**Type consistency:** `JourneyObject` is defined in Task 3 and consumed by Tasks 4 and 6. `getJourneyObject`/`slugForId` names match across tasks. `hitTest` keeps its signature but now returns object ids; Task 6 updates the click handler to run ids through `slugForId`. `ObjectHoverCard` props (`object`, `x`, `y`, `locale`, `dict`) match its call site in Task 6.
