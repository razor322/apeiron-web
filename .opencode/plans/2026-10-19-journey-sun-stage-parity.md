# Add the Sun stage so the home journey matches the prototype

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Insert a "Matahari" (Sun) content stage between the Moon and the Solar System on the home Cosmic Journey, so the panel order and figures match `docs/prototype.html`, and correct the Solar System stage to the prototype's Neptunus figure.

**Architecture:** This is a data-and-copy change on the existing journey. A new `sun` entry joins `STAGES` in `stages.ts` (which automatically makes it a `NAMED_STAGES` ruler label and a calm-path card, because both filter by `kind === "content"`). Its scroll `range` is placed on the shared zoom curve (`exponentAtProgress`) so the ruler, the copy, and the canvas describe the same moment. The scene already draws the Sun and its light line in the band e 10.0 to 11.0, so the new stage must land there. Two dictionary blocks gain a `sun` entry and the `solar-system` figure/copy is corrected. One journey image is added for `sun`, and the mislabelled `star` image is corrected.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, GSAP/ScrollTrigger, canvas 2D, Vitest, bun.

## Global Constraints

- Copy lives only in `src/i18n/en.ts` and `src/i18n/id.ts`; the two must have identical key shape (guarded by `tests/unit/i18n.test.ts`). Components take a `dict` prop and hold no strings.
- No em dash, en dash, or `--` used as a dash in any text written by this work (antislop R-02 / humanizer section 8).
- Every published number carries `sourceName`/`sourceUrl`, `verifiedAt`, `unit`, and `confidenceType`, or it is not shown (R-17/R-38). The new stage reuses the already-sourced facts (`sunlight-earth`, `sun-neptune-light` in `src/features/cosmic-facts/facts.ts`); it introduces no new number.
- Every content stage needs a real NASA image (guarded by `tests/unit/journey-images.test.ts`); the new `sun` stage must have one.
- A content stage's `range` must satisfy `tests/unit/stage-sync.test.ts` (midpoint exponent within 1.2 of the declared exponent, ordered, non-overlapping).
- TypeScript strict; `noUncheckedIndexedAccess` is on.
- Shell is PowerShell 5.1: no `&&` (chain with `;`), `-LiteralPath` for `[locale]` paths, `-UseBasicParsing` on `Invoke-WebRequest`.
- Package manager is bun. Run one test file with `bunx vitest run <path>`. Apeiron dev server is at **http://localhost:3001** (port 3000 is a different project).
- Do NOT stage or commit the user's untracked/modified files: `AGENTS.md`, `docs/APOD-APIs-and-RSS-info.md`, `docs/design/logo/`, `public/` (the user's own icons live here), `src/app/icon.svg`, `src/app/apple-icon.png`, `src/app/layout.tsx`, `src/app/favicon.ico`, `src/components/ui/Navbar.tsx`.

## Context: what differs from the prototype today

Prototype panel order after Earth (`docs/prototype.html`, lines 104-133):

| Prototype panel | Range | Figure | Copy |
|---|---|---|---|
| Bumi | 0.26-0.40 | 12.742 km | Lebar Bumi |
| Bulan | 0.47-0.60 | 384.400 km | Jarak ke Bulan |
| Matahari | 0.65-0.78 | 8:20 | cahaya Matahari sampai ke sini |
| Tata Surya | 0.82-0.95 | 4,2 jam | cahaya Matahari ke Neptunus |
| Berlanjut | 0.95-1.2 | 4,2 tahun | Proxima (the prototype ends here) |

The app today (`src/features/cosmic-journey/stages.ts`): `earth -> moon -> solar-system -> star -> galaxy -> universe -> outro`, where `solar-system` wrongly carries the Sun's `8:20` copy and there is no Sun stage at all. The prototype's `star` (Proxima) panel exists; the app's `galaxy`/`universe`/`outro` are a deliberate extension beyond the prototype and stay.

---

## File Structure

- Modify `src/features/cosmic-journey/stages.ts` - insert the `sun` content stage; re-space the later content stages on the curve; move the two Sun facts from the `solar-system` stage to the new `sun` stage; correct the `solar-system` stage's `figure`/copy.
- Modify `src/features/cosmic-journey/journey-images.ts` - add a `sun` image; correct the `star` image to a star (not the Sun).
- Modify `src/i18n/en.ts`, `src/i18n/id.ts` - add `journey.stages.sun.*`; fix `journey.stages.solar-system.figure`/`headline`/`body`.
- Test: `tests/unit/journey-stages.test.ts` (edit the expected content-stage order), `tests/unit/journey-images.test.ts` (stays green), `tests/unit/stage-sync.test.ts` (stays green).

Task order: the copy and the image first (so the new stage's data is complete), then the stage entry and range re-spacing, then the gate.

---

### Task 1: Correct the Solar System stage and add the Sun stage copy

**Files:**
- Modify: `src/i18n/en.ts`, `src/i18n/id.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `journey.stages.sun.{label,aria,figure,headline,body}` in both dictionaries; corrected `journey.stages.solar-system.{figure,headline,body}`.

- [ ] **Step 1: Fix the Solar System stage copy (en)**

In `src/i18n/en.ts`, inside `journey.stages`, change the `"solar-system"` block to the prototype's Neptunus panel:

```ts
      "solar-system": {
        label: "Solar System",
        aria: "The Solar System",
        figure: "4.2 h",
        headline: "The hours light needs to cross from the Sun to Neptune.",
        body: "Eight planets, one star, and a void far larger than all of them. One of those specks is home.",
      },
```

- [ ] **Step 2: Add the Sun stage copy (en)**

Immediately before the `"solar-system"` block, add a `sun` block:

```ts
      sun: {
        label: "The Sun",
        aria: "The Sun",
        figure: "8:20",
        headline: "The minutes and seconds sunlight needs to reach us.",
        body: "About 149.6 million km, and almost all of it is empty.",
      },
```

- [ ] **Step 3: Mirror both changes in `src/i18n/id.ts`**

Fix `"solar-system"` to:

```ts
      "solar-system": {
        label: "Tata Surya",
        aria: "Tata Surya",
        figure: "4,2 jam",
        headline: "Waktu tempuh cahaya dari Matahari ke Neptunus.",
        body: "Delapan planet, satu bintang, dan ruang kosong yang jauh lebih luas dari semuanya. Salah satu noktah itu adalah rumahmu.",
      },
```

Add the `sun` block before it:

```ts
      sun: {
        label: "Matahari",
        aria: "Matahari",
        figure: "8:20",
        headline: "Menit dan detik yang dibutuhkan cahaya Matahari untuk sampai ke sini.",
        body: "Sekitar 149,6 juta km, dan hampir seluruhnya hampa.",
      },
```

- [ ] **Step 4: Verify key parity**

Run: `bunx vitest run tests/unit/i18n.test.ts`
Expected: PASS (both dictionaries carry the same `journey.stages.sun.*` keys).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/en.ts src/i18n/id.ts
git commit -m "feat: add the Sun stage copy and correct the Solar System figure"
```

---

### Task 2: Add the Sun journey image and correct the star image

**Files:**
- Modify: `src/features/cosmic-journey/journey-images.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `JOURNEY_IMAGES.sun` (the Sun) and a corrected `JOURNEY_IMAGES.star` (a star, not the Sun).

- [ ] **Step 1: Add the Sun image**

The `star` entry currently uses `PIA26681` titled "The Sun" (a Sun photo). Move that to the new `sun` key and give `star` a real star image. In `src/features/cosmic-journey/journey-images.ts`, add:

```ts
  sun: media(
    "PIA26681",
    "medium",
    "The Sun",
    "NASA/JPL-Caltech",
    "The Sun, a sphere of glowing plasma.",
  ),
```

and change the existing `star` entry to a real star photo (a verified NASA Image Library asset, for example Sirius or a generic stellar field):

```ts
  star: media(
    "PIA04204",
    "medium",
    "A nearby star",
    "NASA/JPL-Caltech",
    "A bright star seen against the dark of space.",
  ),
```

Before committing, HEAD-verify both URLs resolve as an image (see Step 2). If `PIA04204` does not resolve or is not a star, search the NASA Image and Video Library for a real star asset and use its id; do not invent an id.

- [ ] **Step 2: Verify both URLs are real images**

Run (PowerShell, one at a time), expecting HTTP 200 with an image content type:

```powershell
Invoke-WebRequest -Method Head -Uri "https://images-assets.nasa.gov/image/PIA26681/PIA26681~medium.jpg" -UseBasicParsing | Select-Object StatusCode, @{n='type';e={$_.Headers['Content-Type']}}
Invoke-WebRequest -Method Head -Uri "https://images-assets.nasa.gov/image/PIA04204/PIA04204~medium.jpg" -UseBasicParsing | Select-Object StatusCode, @{n='type';e={$_.Headers['Content-Type']}}
```

If the variant 403s, the asset exists but that size does not; try `~small` or `~orig` and use the working one.

- [ ] **Step 3: Run the image test (it will fail until Task 3 adds the stage)**

Run: `bunx vitest run tests/unit/journey-images.test.ts`
Expected: PASS today (the `sun` stage does not exist yet, so the test does not require a `sun` image; the `star` entry is still present). This step only confirms no regression from the rename.

- [ ] **Step 4: Commit**

```bash
git add src/features/cosmic-journey/journey-images.ts
git commit -m "feat: add the Sun journey image and give the star stage a real star"
```

---

### Task 3: Insert the Sun stage and re-space the ranges on the curve

**Files:**
- Modify: `src/features/cosmic-journey/stages.ts`
- Test: `tests/unit/journey-stages.test.ts`

**Interfaces:**
- Consumes: the `journey.stages.sun.*` keys (Task 1) and `JOURNEY_IMAGES.sun` (Task 2).
- Produces: a `sun` content stage in `STAGES` between `moon` and `solar-system`; corrected `solar-system` `factIds`.

- [ ] **Step 1: Update the stages test to the new order**

In `tests/unit/journey-stages.test.ts`, extend the expected content-stage ids to include `"sun"`:

```ts
    expect(content.map((s) => s.id)).toEqual([
      "earth",
      "moon",
      "sun",
      "solar-system",
      "star",
      "galaxy",
      "universe",
      "outro",
    ]);
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bunx vitest run tests/unit/journey-stages.test.ts`
Expected: FAIL, the actual array lacks `"sun"`.

- [ ] **Step 3: Insert the stage and re-space the content ranges**

In `src/features/cosmic-journey/stages.ts`, add this object between the `moon` and `solar-system` entries:

```ts
  {
    id: "sun",
    label: "journey.stages.sun.label",
    ariaLabel: "journey.stages.sun.aria",
    figureKey: "journey.stages.sun.figure",
    kind: "content",
    factIds: ["sunlight-earth"],
    range: [0.46, 0.56],
    exponent: 11,
  },
```

Then set the content stages' ranges to these exact values so the windows stay ordered, non-overlapping, and on the curve (the stage-sync test allows a midpoint within 1.2 orders of the declared exponent):

- `earth`: `range: [0.20, 0.32]`, `exponent: 7`
- `moon`: `range: [0.32, 0.42]`, `exponent: 8.89`
- `sun`: `range: [0.46, 0.56]`, `exponent: 11`
- `solar-system`: `range: [0.56, 0.66]`, `exponent: 12`
- `star`: `range: [0.66, 0.78]`, `exponent: 16`
- `galaxy`: `range: [0.78, 0.90]`, `exponent: 21`
- `universe`: `range: [0.90, 0.96]`, `exponent: 27`

Leave `hero`, `mid`, `outro` unchanged.

Also move the Solar System's non-`sunlight` fact to the Sun stage and keep the Solar System stage's own fact. The `sun` stage owns `["sunlight-earth"]`; the `solar-system` stage keeps `["sun-neptune-light"]`:

```ts
    factIds: ["sun-neptune-light"],
```

(The `sun` stage's `factIds` is set in Step 3 above; this makes the split explicit.)

- [ ] **Step 4: Run the stage tests**

Run: `bunx vitest run tests/unit/journey-stages.test.ts tests/unit/stage-sync.test.ts`
Expected: PASS. If `stage-sync` reports a midpoint beyond 1.2 orders for `sun` or `solar-system`, nudge that stage's `range` by up to 0.02 and record the final values in the report (try the exact values first).

- [ ] **Step 5: Run the whole suite**

Run: `bunx vitest run ; bun run typecheck ; bun run lint`
Expected: PASS, exit 0. In particular `tests/unit/journey-images.test.ts` now passes for the new `sun` stage (it has an image from Task 2) and `tests/unit/i18n.test.ts` passes (Task 1).

- [ ] **Step 6: Commit**

```bash
git add src/features/cosmic-journey/stages.ts tests/unit/journey-stages.test.ts
git commit -m "feat: add the Sun stage between the Moon and the Solar System"
```

---

### Task 4: Full gate and live verification

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

- [ ] **Step 2: Live check at port 3001**

The Apeiron dev server runs at http://localhost:3001 (port 3000 is a different project). Confirm by inspecting the rendered HTML and by scrolling the home page:

- The journey panel order after Earth is Earth, then the Moon, then **the Sun (8:20, "cahaya Matahari sampai ke sini")**, then the Solar System (4,2 jam, light to Neptune), matching `docs/prototype.html`.
- The ruler shows the Sun as a stage label between the Moon and the Solar System, and it highlights when the reader is in the Sun stage.
- During the Sun stage the canvas shows the Sun and the Sun to Earth light line.
- The calm (reduced-motion) path shows a Sun card with the `PIA26681` image and credit.
- No console errors.

- [ ] **Step 3: Commit any doc change**

```bash
git add docs/runbook.md
git commit -m "docs: note the added Sun journey stage"
```

---

## Self-Review

**Spec coverage:**
- The prototype's "Matahari" panel, missing in the app: Task 1 (copy) + Task 3 (stage).
- The Solar System stage showing the prototype's Neptunus figure (4,2 jam), not the Sun's 8:20: Task 1.
- Panel order Bumi, Bulan, Matahari, Tata Surya: Task 3.
- Every content stage keeps a real NASA image: Task 2.
- The galaxy/universe/outro extension is preserved: no task removes it (recorded decision from the planning questions).

**Recorded decisions:**
- A new `sun` stage is added (not a mere copy fix), because the prototype shows the Sun as its own panel between the Moon and the Solar System.
- The Sun stage's visual is the Sun plus the Sun to Earth light line the scene already draws in the e 10.0 to 11.0 band, plus the `PIA26681` image on the calm path.
- The star stage's image is corrected to a real star, because it currently shows the Sun (which now belongs to the `sun` stage).
- Ranges are re-spaced by the plan (the executed author of this task is told the exact values); the stage-sync test is the guard.

**Placeholder scan:** the only conditional item is the exact NASA id and variant for the corrected `star` image (task 2), which the implementer HEAD-verifies at execution; no invented id is committed. Every code step shows code.

**Type consistency:** the new stage uses the existing `JourneyStageDef` shape (`id, label, ariaLabel, figureKey, kind, factIds, range, exponent`). `figureKey` and `label`/`ariaLabel` are dictionary keys resolved by `readCopy`, matching how `moon` already works. `NAMED_STAGES`, `JourneyProgress`, `ScaleRuler`, and the calm `CalmStage` all derive from `STAGES`/`kind === "content"`, so the Sun stage appears in each with no further change.
