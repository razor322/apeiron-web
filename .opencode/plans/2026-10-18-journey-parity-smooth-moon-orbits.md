# Journey Prototype Parity (ALL TASKS DONE)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the prototype on three points: smooth (eased) scroll, a visible "Moon" panel during the Earth zoom-out, and planet orbit rings that read clearly around the Sun.

**Scope:** full motion only. The Moon's own orbit ring is deliberately skipped (user's call) in this plan.

**Architecture:** Three small, independent changes. The scroll smoothing is a one-value change on the existing GSAP ScrollTrigger (`scrub: true` becomes `scrub: 0.6`). The Moon panel is a new content stage inserted between `earth` and `solar-system`, with its own scroll window derived from the shared zoom curve, plus the canvas label the prototype draws. The orbit rings get a brighter alpha and an earlier fade-in so they are visible across the Solar System window, not only at its end.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, GSAP/ScrollTrigger, canvas 2D, Vitest (jsdom via first-line pragma), bun.

## Global Constraints

- Copy lives only in `src/i18n/en.ts` and `src/i18n/id.ts`; the two must have identical key shape (guarded by `tests/unit/i18n.test.ts`). Components take a `dict` prop and hold no strings.
- No em dash, en dash, or `--` used as a dash in any text written by this work (antislop R-02 / humanizer section 8).
- Every published number carries `sourceName`/`sourceUrl`, `verifiedAt`, `unit`, and `confidenceType`, or it is not shown (R-17/R-38).
- TypeScript strict; `noUncheckedIndexedAccess` is on: indexed access yields `T | undefined`.
- The canvas stays `aria-hidden`. Reduced-motion contract intact: the canvas and the pinned scrub run only in full motion.
- Stage `range` values must stay consistent with the shared zoom curve in `exponent.ts` (guarded by `tests/unit/stage-sync.test.ts`). Any range added or moved must satisfy that test.
- Shell is PowerShell 5.1: no `&&` (chain with `;`), `-LiteralPath` for `[locale]` paths, `-UseBasicParsing` on `Invoke-WebRequest`.
- Package manager is bun. Run one test file with `bunx vitest run <path>`. Dev server at **http://localhost:3000**.
- Do NOT stage or commit the user's untracked files: `AGENTS.md`, `docs/APOD-APIs-and-RSS-info.md`, `docs/design/logo/`, `public/`, `src/app/icon.svg`, `src/app/apple-icon.png`, and the modified `src/app/layout.tsx`, `src/components/ui/Navbar.tsx`, `src/app/favicon.ico`.

---

## File Structure

- Modify `src/features/cosmic-journey/use-journey-progress.ts` - change the ScrollTrigger scrub from instant to an eased catch-up.
- Modify `src/features/cosmic-journey/stages.ts` - insert a new `moon` content stage between `earth` and `solar-system`, and shift the later stages' ranges to make room (keeping them on the zoom curve).
- Modify `src/features/cosmic-journey/scene/scene.ts` - draw the "Bumi, kamu di sini" label during the Earth zoom-out (as the prototype does), and make the planet orbit rings visible earlier and brighter.
- Modify `src/i18n/en.ts`, `src/i18n/id.ts` - add the `moon` stage copy and the "Earth, you are here" canvas label key.
- Modify `tests/unit/stage-sync.test.ts` only if the new stage needs an added assertion; otherwise it must keep passing.
- Test: `tests/unit/journey-stages.test.ts` (edit for the new stage), `tests/unit/stage-sync.test.ts` (keep green).

Task order: smoothing first (independent), then the orbit rings (independent, canvas only), then the Moon panel (touches stages + copy + scene).

---

### Task 1: Eased scroll (smooth like the prototype)

> **Status: DONE**.

### Task 1: Eased scroll (smooth like the prototype)

**Files:**
- Modify: `src/features/cosmic-journey/use-journey-progress.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: the same `useJourneyProgress(reduced)` return shape; only the scrub feel changes.

- [x] **Step 1: Change the scrub value**

In `src/features/cosmic-journey/use-journey-progress.ts`, in the GSAP tween, change `scrub: true` to `scrub: 0.6`:

```ts
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onRefresh: (self) => {
            state.p = self.progress;
            apply(self.progress);
          },
        },
```

Update the comment above the tween to note that `scrub: 0.6` gives the eased catch-up the prototype uses (its `cur += (target - cur) * (1 - exp(-dt*6))` loop), instead of following scroll raw.

- [x] **Step 2: Verify**

Run: `bun run typecheck ; bun run lint ; bun run build`
Expected: exit 0 each. (Scroll feel is visual; confirm live in Task 4.)

- [x] **Step 3: Commit**

```bash
git add src/features/cosmic-journey/use-journey-progress.ts
git commit -m "feat: ease the journey scrub so scrolling glides like the prototype"
```

---

### Task 2: Visible planet orbit rings

> **Status: DONE**.

### Task 2: Visible planet orbit rings

**Files:**
- Modify: `src/features/cosmic-journey/scene/scene.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: the orbit rings around the Sun draw brighter and from an earlier exponent, so they read across the Solar System stage.

- [x] **Step 1: Brighten and widen the orbit fade**

In `scene.ts`, find the orbit-rings block:

```ts
    const orbA = 0.11 * smooth(11, 12, e) * localFade;
    if (orbA > 0.004) {
      ctx.strokeStyle = `rgba(232,228,220,${orbA})`;
      ctx.lineWidth = 1;
      for (const r of ORBITS) {
        const rp = r * ppm;
        if (rp < 4 || rp > 8000) continue;
        ctx.beginPath();
        ctx.arc(sx, sy, rp, 0, TAU);
        ctx.stroke();
      }
    }
```

Replace the `orbA` line so the rings appear from the start of the Solar System window and are strong enough to see:

```ts
    // Orbit rings: visible across the whole Solar System stage, not only at its
    // end, so the planets read as circling one star.
    const orbA = 0.22 * smooth(9.5, 11, e) * localFade;
```

Keep the rest of the block (the `if`, the loop, the `rp` guard) unchanged.

- [x] **Step 2: Verify**

Run: `bun run typecheck ; bun run lint ; bun run build`
Expected: exit 0 each.

- [x] **Step 3: Commit**

```bash
git add src/features/cosmic-journey/scene/scene.ts
git commit -m "feat: make the planet orbit rings visible across the Solar System stage"
```

---

### Task 3: A Moon panel during the Earth zoom-out

> **Status: DONE**.

### Task 3: A Moon panel during the Earth zoom-out

**Files:**
- Modify: `src/features/cosmic-journey/stages.ts`
- Modify: `src/features/cosmic-journey/scene/scene.ts`
- Modify: `src/i18n/en.ts`, `src/i18n/id.ts`
- Test: `tests/unit/journey-stages.test.ts` (edit)

**Interfaces:**
- Consumes: `progressAtExponent`, `exponentAtProgress`, `MAX_EXPONENT`.
- Produces:
  - A new content stage with `id: "moon"` inserted between `earth` and `solar-system` in `STAGES`.
  - Its `range` placed on the zoom curve so the reader sees the copy while the camera is at the Moon-orbit scale (e about 8 to 9).
  - A canvas label key `journey.stages.moon.label` and a "Earth, you are here" label key `journey.stages.moon.youAreHere` (the prototype draws `Bumi, kamu di sini` here).

- [x] **Step 1: Add the stage copy**

In `src/i18n/en.ts`, inside `journey.stages`, add a `moon` block after `earth`:

```ts
      moon: {
        label: "The Moon",
        aria: "The Moon's orbit",
        figure: "384,400 km",
        headline: "The distance to the Moon. Earth has become a point.",
        body: "About 30 times the width of Earth. Only twelve people have ever walked there.",
        youAreHere: "Earth, you are here",
      },
```

Note: the Earth-to-Moon distance (384,400 km) is already a sourced fact (`earth-moon-distance` in `facts.ts`, NASA). This stage reuses the same figure as its editorial headline; it introduces no new number. The `figure` string matches the existing app convention for editorial figures.

Mirror the same keys in `src/i18n/id.ts` (for example `label: "Bulan"`, `aria: "Orbit Bulan"`, `headline: "Jarak ke Bulan. Bumi sudah menjadi titik."`, `body: "Sekitar 30 kali lebar Bumi. Hanya dua belas manusia yang pernah berjalan di sana."`, `youAreHere: "Bumi, kamu di sini"`). Run `bunx vitest run tests/unit/i18n.test.ts` and expect PASS.

- [x] **Step 2: Insert the stage and re-space the later ranges**

In `src/features/cosmic-journey/stages.ts`, add this object to `STAGES` between the `earth` and `solar-system` entries:

```ts
  {
    id: "moon",
    label: "journey.stages.moon.label",
    ariaLabel: "journey.stages.moon.aria",
    figureKey: "journey.stages.moon.figure",
    kind: "content",
    factIds: ["earth-moon-distance"],
    range: [0.34, 0.46],
    exponent: 8.89,
  },
```

Then shift and re-space the later content stages so the windows stay ordered, non-overlapping, and on the curve (the stage-sync test allows midpoint within 1.2 orders of the declared exponent). Use these exact ranges:

- `earth`: `range: [0.20, 0.34]`, `exponent: 7` (unchanged)
- `moon` (new): `range: [0.34, 0.46]`, `exponent: 8.89`
- `solar-system`: `range: [0.46, 0.60]`, `exponent: 12`
- `star`: `range: [0.60, 0.76]`, `exponent: 16`
- `galaxy`: `range: [0.76, 0.90]`, `exponent: 21`
- `universe`: `range: [0.90, 0.96]`, `exponent: 27`

Verify each midpoint against the curve (the test does this). If `solar-system` or `star` drifts past 1.2 orders at its new midpoint, nudge its `range` by up to 0.02 and record the final values in the report.

- [x] **Step 3: Update the stages test**

`tests/unit/journey-stages.test.ts` lists the expected content stage ids. Add `"moon"` between `"earth"` and `"solar-system"` in the expected array so it matches the new order:

```ts
    expect(content.map((s) => s.id)).toEqual([
      "earth",
      "moon",
      "solar-system",
      "star",
      "galaxy",
      "universe",
      "outro",
    ]);
```

(Adjust to the file's existing assertion shape.)

- [x] **Step 4: Draw the Moon label and the "you are here" mark on the canvas**

In `scene.ts`, the Moon block already draws the Moon. Extend it so that during the Moon window it also draws the prototype's Earth marker and label. Add, inside the Moon block (where `mp`, `ex`, `ey`, `mA` are in scope), after the Moon dot fill:

```ts
        const hereName = labels?.stars["journey.stages.moon.youAreHere"];
        if (hereName) {
          ctx.save();
          ctx.globalAlpha = mA * 0.7;
          ctx.strokeStyle = "#E8A15B";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ex + 6, ey + 6);
          ctx.lineTo(ex + 30, ey + 30);
          ctx.stroke();
          label(hereName, ex + 34, ey + 34, mA, "#E8A15B");
          ctx.restore();
        }
```

In `CosmicJourney.tsx`, add the key to the labels map built before `createScene`:

```tsx
      "journey.stages.moon.youAreHere": readCopy(dict, "journey.stages.moon.youAreHere"),
```

- [x] **Step 5: Verify**

Run: `bunx vitest run tests/unit/stage-sync.test.ts tests/unit/journey-stages.test.ts tests/unit/i18n.test.ts`
Expected: PASS.
Run: `bunx vitest run ; bun run typecheck ; bun run lint ; bun run build`
Expected: PASS, exit 0.

- [x] **Step 6: Commit**

```bash
git add src/features/cosmic-journey/stages.ts src/features/cosmic-journey/scene/scene.ts src/features/cosmic-journey/CosmicJourney.tsx src/i18n/en.ts src/i18n/id.ts tests/unit/journey-stages.test.ts
git commit -m "feat: add the Moon stage so the Earth zoom-out has copy"
```

---

### Task 4: Full gate and live verification

> **Status: DONE** (gate 187/187, live verified at :3000).

### Task 4: Full gate and live verification

**Files:**
- Modify: `docs/runbook.md` only if a note is needed.

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

- Scrolling glides with a short catch-up, not stepping with the raw scroll.
- During the Earth zoom-out (between the Earth surface and the Solar System) the "The Moon" copy is visible, and the canvas shows "Earth, you are here".
- Planet orbit rings are visible around the Sun across the Solar System stage.
- The Moon's own orbit ring is still not drawn (skipped by decision).

- [x] **Step 3: Commit any doc change**

```bash
git add docs/runbook.md
git commit -m "docs: note the journey scrub easing and Moon stage"
```

---

## Self-Review

**Spec coverage:**
- Smooth scroll: Task 1 (`scrub: 0.6`, matching the prototype's exponential catch-up).
- Moon panel visible during the Earth zoom-out: Task 3.
- Planet orbit rings visible around the Sun: Task 2.
- Moon's own orbit ring skipped: honored; no task adds it, and Task 3 Step 4 only adds the Earth marker/label, not a moon orbit ring.

**Recorded decisions:**
- "orbit Matahari" was clarified as the planet orbit rings around the Sun; Task 2 makes them visible.
- The Moon stage reuses the already-sourced 384,400 km figure; it adds no new number.
- Inserting the `moon` stage shifts later ranges; Task 3 keeps them on the zoom curve and the stage-sync test guards it.

**Placeholder scan:** no TBD. Every code step shows code. Task 3 Step 2 gives exact ranges and a bounded adjustment rule if the sync test complains.

**Type consistency:** `JourneyStageDef` fields for the new stage match the existing shape (`id`, `label`, `ariaLabel`, `figureKey`, `kind`, `factIds`, `range`, `exponent`). `ScaleRuler` already reads `NAMED_STAGES` (all content stages), so the Moon automatically appears as a ruler label with no further change. The canvas label map key `journey.stages.moon.youAreHere` is added in both the dictionary and `CosmicJourney.tsx`.
