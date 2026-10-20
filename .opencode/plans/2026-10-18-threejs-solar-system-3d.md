# Apeiron Solar System 3D (Three.js) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `/{locale}/solar-system-3d` page (currently GSS spheres) with a real Three.js solar system: the Sun, eight planets, Pluto, moons, rings, a thousands-rock asteroid belt, Ceres and a Kuiper hint, all orbiting the Sun, with a planet rail, an info card and a NASA-sourced information panel in Bahasa Indonesia.

**Architecture:** A framework-agnostic vanilla Three.js class (`SolarSystem`) owns the renderer, scene, camera, render loop and disposal. A thin React client component mounts it (`dynamic(..., { ssr: false })`), renders the HTML UI (rail, info card, controls), and calls the class's imperative methods. All body data and Indonesian copy live in one typed module shared by the 3D scene and the UI. Textures are self-hosted under `public/textures` (NASA public domain) with a procedural fallback per body.

**Tech Stack:** Three.js `0.186.1` (+ `@types/three` `0.186.0`), Next.js 16.4.1, React 19.3, TypeScript strict, Tailwind v4, GSAP 3.15 (camera tweens), Vitest, Playwright.

## Global Constraints

- Copy the user sees lives only in `src/i18n/en.ts` and `src/i18n/id.ts`; the two must stay key-identical (guarded by `tests/unit/i18n.test.ts`). The 3D page's **user-facing copy must be Bahasa Indonesia** (per the spec), which is the `id` dictionary; the page is locale-routed, so the `en` dictionary carries an English translation with the same keys. Body data (names, stats, signature facts) lives in `solar-system.data.ts` with a `copy` field per body, Indonesian; the page reads that field.
- No em dash, en dash, or `--` used as a dash in any text written by this work (antislop R-02 / humanizer section 8).
- Every published number carries a real source. The body stats come from `solar-system.data.ts`, which cites NASA Solar System Exploration (`science.nasa.gov`) for every figure; moon counts are shown as `90+`, `140+` etc., never exact unless verified at build time. No invented figures (R-17/R-38).
- TypeScript strict; `noUncheckedIndexedAccess` is on: indexed access yields `T | undefined`. Three.js is pinned exactly in `package.json`.
- Resilience (project rules): the page renders readable content with no WebGL and no JS-driven scene; the canvas is decorative (`role="img"` + `aria-label`), the info card and rail are the real content; the scene respects `prefers-reduced-motion` (starts paused); no leaked GPU memory, RAF, listeners or observers across React StrictMode double-mount and route changes.
- Internal navigation uses `next/link`. Remote images use plain `<img>` with the eslint-disable only where a remote URL must be shown; the 3D textures are loaded by the Three.js loader, not `<img>`.
- Shell is PowerShell 5.1: no `&&` (chain with `;`), `-LiteralPath` for `[locale]` paths, `-UseBasicParsing` on `Invoke-WebRequest`.
- Package manager is bun. Run one test file with `bunx vitest run <path>`. Dev server at **http://localhost:3000**.
- Do NOT stage or commit the user's untracked/modified files: `AGENTS.md`, `docs/APOD-APIs-and-RSS-info.md`, `docs/design/logo/`, `public/` (the user's own icons live here; the plan adds `public/textures/` under it, which is fine to commit), `src/app/icon.svg`, `src/app/apple-icon.png`, `src/app/layout.tsx`, `src/app/favicon.ico`, `src/components/ui/Navbar.tsx`.

### Textures: self-host vs remote (decision, with reasons)

Both options were compared:
- **Self-host** (`public/textures/`, served from Vercel's edge CDN): cacheable, no CORS, no third-party rate limits, stable. Costs repo size (about 10–30 MB). Vercel's per-deployment source limit (about 2 GB) is far above this, and the assets are static so they never enter the JS bundle. **Chosen.**
- **Remote** NASA URLs: smaller repo, but NASA hosts (`svs.gsfc.nasa.gov`, `nssdc.gsfc.nasa.gov`) send no CDN cache headers and sometimes no CORS, and URLs drift; a texture failing at runtime breaks a planet. Rejected.

Assets go to `public/textures/` with `public/textures/LICENSES.md` recording each source and its license (NASA public domain, or three.js MIT-bundled example textures). Any body without a verified, cleanly licensed texture uses the procedural fallback (canvas-generated or shader maps) in that body's exact colors.

### Verified during planning (do not re-assume)

- `three@0.186.1`, `@types/three@0.186.0` are the current stable versions on npm.
- `three.js` own example textures reachable now (HTTP 200): `earth_atmos_2048.jpg`, `earth_clouds_1024.png`, `earth_lights_2048.png`, `earth_specular_2048.jpg`, `earth_normal_2048.jpg`, `moon_1024.jpg` (all under `raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/`). These are MIT-bundled with three.js examples.
- NASA reachable now (HTTP 200): `svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_1k.jpg` (Moon LRO), `nssdc.gsfc.nasa.gov/image/planetary/mars/marsglobe1.jpg` (Mars). `solarsystemscope.com` returns 403 and `upload.wikimedia.org` returned 400 from this network, so neither is relied on.
- No other per-planet NASA equirectangular texture was verified from this network. Jupiter, Saturn, Uranus, Neptune, Venus, Mercury therefore ship with a **procedural** surface by default (bands/noise in the exact spec colors), with a hook to swap in a real texture if the implementer verifies one at build time.
- Project facts: no `three`/`react-three-fiber` installed yet; `gsap@^3.15.0` present; Next 16.4.1; React 19.3.0; Vitest runs `environment: "node"` globally (`// @vitest-environment jsdom` opt-in per file); Playwright config boots `bun run dev` at `http://localhost:3000` with `reuseExistingServer: true`.

### Design direction (binds the page)

Follows `docs/design/design-plan.md`: void `#05060A`, starlight `#E8E4DC`, dust `#8A8D98`, single amber `#E8A15B`, hairline `rgba(232,228,220,0.16)`; Instrument Serif (display), Inter (body), JetBrains Mono (data). The 3D scene is the page's one MOTION moment (MOTION 3); everything around it stays quiet. File paths use the existing project alias `@/*` -> `./src/*`.

### Adapted project paths (the spec's paths are generic; these are the real ones)

- `src/features/solar-system-3d/SolarSystem.ts` (the vanilla class)
- `src/features/solar-system-3d/bodies/*.ts`, `rings.ts`, `asteroid-belt.ts`, `kuiper-belt.ts`, `starfield.ts`, `sun.ts`
- `src/features/solar-system-3d/shaders/*.glsl.ts` (GLSL as TS template strings)
- `src/features/solar-system-3d/solar-system.data.ts` (body data + Indonesian copy + scale constants)
- `src/features/solar-system-3d/SolarSystemCanvas.tsx` (React client wrapper + rail + info card + controls)
- `src/app/[locale]/solar-system-3d/page.tsx` (rewrite), `loading.tsx` (keep)
- `public/textures/**`, `public/textures/LICENSES.md`
- `scripts/generate-ring-strip.ts` (build the ring strip textures)
- Tests: `tests/unit/solar-system-scene.test.ts`, `tests/unit/solar-system-data.test.ts`, `tests/unit/orbit-spacing.test.ts`, `tests/unit/ring-strip.test.ts`, `tests/e2e/solar-system-3d.spec.ts`

---

## Phase map (each phase ends with a reviewable, committed result)

- **Phase 0** - dependency, textures, data module, scale math (pure, tested).
- **Phase 1** - the Three.js core: renderer, camera, sun + light, eight planets + Pluto orbiting and spinning, orbit lines, starfield. Scene is real and framed.
- **Phase 2** - rings (Saturn/Uranus/Neptune) with a generated strip texture.
- **Phase 3** - asteroid belt + Ceres + Kuiper hint (InstancedMesh).
- **Phase 4** - moons (tier 2, toggle).
- **Phase 5** - post-processing (bloom), labels, picking/focus, adaptive quality, performance.
- **Phase 6** - the React page: rail, info card, controls, Indonesian copy, accessibility, failure states.
- **Phase 7** - tests (unit + Playwright), README, licenses, report; Vercel deployment check.

Resume at the first phase without a completion line in the SDD ledger.

---

## Phase 0: Foundation

### Task 0.1: Add Three.js and types

**Files:**
- Modify: `package.json`, `bun.lock`

**Interfaces:**
- Produces: `three@0.186.1`, `@types/three@0.186.0`.

- [ ] **Step 1:** Run `bun add three@0.186.1` then `bun add -d @types/three@0.186.0`.

- [ ] **Step 2:** Verify imports resolve: create a throwaway check by running `bun run typecheck` (expect exit 0) after a later task imports three. For now, confirm both versions appear in `package.json`.

- [ ] **Step 3:** Commit: `git add package.json bun.lock` then `git commit -m "chore: add three.js for the solar system page"`.

### Task 0.2: Scale constants and body data (pure, tested)

**Files:**
- Create: `src/features/solar-system-3d/solar-system.data.ts`
- Test: `tests/unit/solar-system-data.test.ts`

**Interfaces:**
- Produces:
  - `type BodyId = "sun" | "mercury" | "venus" | "earth" | "mars" | "ceres" | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto"`.
  - `type BodyDef = { id: BodyId; nameKey: string; displayRadius: number; orbitRadius: number | null; orbitPeriod: number | null; spinPeriod: number; spinRetrograde: boolean; axialTiltDeg: number; inclinationDeg: number; startAngleDeg: number; color: string; ringInner?: number; ringOuter?: number; copy: { type: string; atmosphere: string; distance: string; orbit: string; day: string; moons: string; temp: string; fact: string } }`.
  - `BODIES: BodyDef[]` with the exact values from the spec's section 3.1 master table and section 9 stats (in scene units and Indonesian copy).
  - `SCALE = { sunRadius: 3.5, earthRadius: 0.5, beltInner: 15, beltOuter: 19, kuiperInner: 47, kuiperOuter: 58 }`.
  - `compressRadius(realRadiusMeters: number): number` implementing `0.5 * sqrt(real / earth)` with `earth = 6.371e6` metres.
  - `bodyById(id: BodyId): BodyDef | undefined`.

- [ ] **Step 1: Write the failing test** asserting: `BODIES` has 11 entries (Sun + 10, including Ceres and Pluto); every orbit radius is strictly increasing from Mercury to Pluto (Sun has `orbitRadius: null`); `compressRadius(6.371e6)` ≈ 0.5; `compressRadius` is monotonic; every body has a non-empty Indonesian `copy.fact`; retrograde flags are `true` for Venus, Uranus, Pluto; Saturn has a `ringOuter`. Provide the real assertions with concrete expected values from the spec table.

- [ ] **Step 2:** Run `bunx vitest run tests/unit/solar-system-data.test.ts`, expect FAIL (module missing).

- [ ] **Step 3:** Write the module with the spec's numbers verbatim (section 3.1 table and section 9 stats). Every stat string cites no number the spec did not give; moon counts use `90+`/`140+` style.

- [ ] **Step 4:** Run the test, expect PASS. Then `bun run typecheck ; bun run lint`.

- [ ] **Step 5:** Commit: `git add src/features/solar-system-3d/solar-system.data.ts tests/unit/solar-system-data.test.ts` then `git commit -m "feat: add solar system body data and scale constants"`.

### Task 0.3: Download and register textures

**Files:**
- Create: `public/textures/**`, `public/textures/LICENSES.md`
- Create: `scripts/fetch-textures.sh` (documented fetch commands; run once, assets committed)

- [ ] **Step 1:** Download the verified assets into `public/textures/`: from the three.js repo, `earth_atmos_2048.jpg`, `earth_clouds_1024.png`, `earth_lights_2048.png`, `earth_specular_2048.jpg`, `earth_normal_2048.jpg`, `moon_1024.jpg`; from NASA, the LRO Moon map (`lroc_color_poles_1k.jpg`) and the Mars globe (`marsglobe1.jpg`). Record origin URL and license per file in `public/textures/LICENSES.md` (three.js examples are MIT; NASA public domain).

- [ ] **Step 2:** For Jupiter, Saturn, Uranus, Neptune, Venus, Mercury: attempt to verify a NASA equirectangular map; if none verifies (expected, given planning), do not commit a guessed file. These bodies use the procedural fallback in Task 1.5. Record in `LICENSES.md` which bodies are procedural and why.

- [ ] **Step 3:** Verify every committed file is a real image (open a couple, confirm dimensions). Keep 2K for Earth/Sun/Mars/Moon, 1K for the rest.

- [ ] **Step 4:** Commit: `git commit -m "assets: add NASA and three.js planet textures with licenses"`.

---

## Phase 1: The Three.js core scene

### Task 1.1: SolarSystem class skeleton (renderer, camera, loop, disposal)

**Files:**
- Create: `src/features/solar-system-3d/SolarSystem.ts`
- Test: `tests/unit/solar-system-scene.test.ts` (jsdom pragma; test the pure helpers and the class's public contract with a null/mock WebGL context guard, not real rendering)

**Interfaces:**
- Consumes: `BODIES`, `SCALE` from `solar-system.data.ts`.
- Produces: `class SolarSystem` with:
  - `constructor(canvas: HTMLCanvasElement, opts?: { quality?: Quality })`.
  - `start(): void`, `pause(): void`, `setTimeScale(n: number): void`, `setQuality(q: Quality): void`.
  - `toggleOrbits(on: boolean): void`, `toggleMoons(on: boolean): void`, `toggleLabels(on: boolean): void`.
  - `focus(id: BodyId): void`, `resetView(): void`.
  - `on(event: "hover" | "select" | "tier", cb: (payload) => void): () => void`.
  - `dispose(): void`.
  - `readonly info: { tier: Quality; fps: number; drawCalls: number; triangles: number }`.
  - `type Quality = "low" | "medium" | "high"`.

- [ ] **Step 1: Write the failing test** for the pure helpers the class exposes for testing: a `frameDelta(prev, now)` clamp (delta clamped to ≤ 0.1 s) and a `deviceTier(devicePixelRatio, cores, isMobile)` picker, plus that `new SolarSystem(canvas)` with a canvas whose `getContext` returns null throws a typed `WebGLUnavailableError` (so the UI can show the failure state). Assert `dispose()` is idempotent.

- [ ] **Step 2:** Run it, expect FAIL.

- [ ] **Step 3:** Implement the class skeleton: `WebGLRenderer({ canvas, antialias, alpha:false })`, `outputColorSpace = SRGBColorSpace`, tone mapping `ACESFilmicToneMapping`, a `PerspectiveCamera(45, …, 0.1, 2000)` at the default high 3/4 view, `OrbitControls` (damping, `minDistance` > Sun radius + margin, `maxDistance` 160, pan off), a `clock`, and a `requestAnimationFrame` loop that advances `simTime += frameDelta * timeScale`. Guard missing WebGL with `WebGLUnavailableError`. Implement `dispose()` to cancel RAF, dispose renderer (`renderer.dispose()`), and remove listeners; make it idempotent.

- [ ] **Step 4:** Run the test, expect PASS; `bun run typecheck ; bun run lint`.

- [ ] **Step 5:** Commit: `git commit -m "feat: add the SolarSystem Three.js core (renderer, camera, loop)"`.

### Task 1.2: Sun, light, starfield, background

**Files:**
- Create: `src/features/solar-system-3d/sun.ts`, `starfield.ts`
- Modify: `SolarSystem.ts`

**Interfaces:**
- Produces: `createSun(): { group: THREE.Group; light: THREE.PointLight; mesh: THREE.Mesh }` and `createStarfield(): THREE.Points`.

- [ ] **Step 1: Write the failing test** (pure parts): `createSun().light` is a `PointLight` at the origin with `decay === 0`; `createStarfield()` point count is within the desktop budget; the sun radius equals `SCALE.sunRadius`.

- [ ] **Step 2:** Run, expect FAIL.

- [ ] **Step 3:** Implement: `scene.background = new THREE.Color("#04050a")`; `AmbientLight("#0a0d18", low)`; `PointLight("#fff1d6", intensity, 0, 0)` at the origin; a `MeshBasicMaterial` Sun sphere (radius `SCALE.sunRadius`) with an additive glow sprite; a `Points` starfield on a shell (radius 600–900, `sizeAttenuation:false`, 4000–8000 stars, slight color temperature variation) that follows the camera position. Explicitly no floor/ground mesh.

- [ ] **Step 4:** Run, expect PASS; typecheck + lint.

- [ ] **Step 5:** Commit: `git commit -m "feat: add the sun, sun light and starfield"`.

### Task 1.3: Planets, Pluto and orbit lines

**Files:**
- Create: `src/features/solar-system-3d/bodies/planet.ts`
- Modify: `SolarSystem.ts`

**Interfaces:**
- Consumes: `BODIES`, `compressRadius`.
- Produces: per body, the scene graph from spec section 3.2: `orbitPlane` (Group, `rotation.x = inclinationDeg`), `orbitPivot` (Group, position set per frame), `tilt` (Group, `rotation.z = axialTiltDeg`), `spin` (Mesh/Group, `rotation.y` advanced by `sign * 2π * simTime / spinPeriod`). Orbit line = `LineLoop` (256 segments, white, opacity 0.10, `transparent`, `depthWrite:false`) added to `orbitPlane`.

- [ ] **Step 1: Write the failing test** (pure): the per-frame position function `orbitPosition(def, simTime, out: Vector3)` puts a body at radius `def.orbitRadius`, in the direction `θ = startAngleDeg + 2π*simTime/orbitPeriod`, counter-clockwise seen from +Y (`x = r cos θ`, `z = −r sin θ`); retrograde spin sign is `-1` for Venus/Uranus/Pluto.

- [ ] **Step 2:** Run, expect FAIL.

- [ ] **Step 3:** Implement with `SphereGeometry(r, 64, 64)` and `MeshStandardMaterial` (roughness 0.9); Earth uses its texture (Task 1.4); the rest use color from `BodyDef.color` until Task 1.5. Add orbit lines; add the 11 bodies. Do not set axial tilt on the spin mesh; the `tilt` group carries it. Jupiter/Saturn use `scale.y` oblate (0.935 / 0.90).

- [ ] **Step 4:** Run, expect PASS; typecheck + lint.

- [ ] **Step 5:** Commit: `git commit -m "feat: add the planets, Pluto and orbit lines"`.

### Task 1.4: Earth textures (day, clouds, night, atmosphere)

**Files:**
- Create: `src/features/solar-system-3d/bodies/earth.ts`
- Modify: `SolarSystem.ts`

**Interfaces:**
- Produces: `createEarth(loader): { group: THREE.Group; update(sunDir: THREE.Vector3): void }` — day map (`earth_atmos_2048.jpg`, `SRGBColorSpace`), cloud sphere (radius ×1.01, `earth_clouds_1024.png` alpha, rotates slightly faster), night-lights map blended on the unlit side via `onBeforeCompile` or a small `ShaderMaterial`, atmosphere fresnel on a `BackSide` sphere (radius ×1.06, additive, `#4f8fe8`).

- [ ] **Step 1: Write the failing test** (pure): the night/day blend factor for a surface normal `n` and sun direction `s` is 0 when `dot(n,s) > 0` (day) and approaches 1 on the night side; the cloud sphere radius is `1.01 × earthRadius`.

- [ ] **Step 2:** Run, expect FAIL.

- [ ] **Step 3:** Implement using `THREE.TextureLoader` with `colorSpace` set correctly (`SRGBColorSpace` for color/day/night/clouds; `NoColorSpace` for data maps).

- [ ] **Step 4:** Run, expect PASS; typecheck + lint.

- [ ] **Step 5:** Commit: `git commit -m "feat: add textured Earth with clouds, night lights and atmosphere"`.

### Task 1.5: Procedural surfaces for bodies without a verified texture

**Files:**
- Create: `src/features/solar-system-3d/bodies/procedural.ts`
- Modify: `SolarSystem.ts`

**Interfaces:**
- Produces: `proceduralTexture(kind: "gas" | "rocky" | "icy", colors: string[], opts?): THREE.CanvasTexture` — latitude bands with noise displacement for gas giants (Jupiter zones/belts + Great Red Spot `#b8472f`; Saturn soft bands; Uranus faint haze; Neptune streaks + optional Great Dark Spot), high-frequency crater noise for rocky (Mercury, Venus cloud swirls, Mars rust with polar caps), and a Pluto map with the heart-shaped Tombaugh Regio. Colors are the exact spec values.

- [ ] **Step 1: Write the failing test** (pure where possible): the generated texture's canvas has power-of-two dimensions; the `gas` generator with Jupiter colors produces more than one distinct row-average color (banding exists); the Pluto generator marks a bright region (heart) above a brightness threshold.

- [ ] **Step 2:** Run, expect FAIL.

- [ ] **Step 3:** Implement the generators (2D canvas, `noise()` from a small in-repo value-noise helper or `THREE.MathUtils`, no new dependency). Set `colorSpace = SRGBColorSpace` on the resulting texture. Wire each non-textured body to the right generator.

- [ ] **Step 4:** Run, expect PASS; typecheck + lint; run `bun run build` to confirm the client page compiles.

- [ ] **Step 5:** Commit: `git commit -m "feat: add procedural surfaces for the untextured bodies"`.

**Phase 1 review checkpoint:** the scene renders the Sun and all bodies orbiting and spinning, framed nicely, no floor, no overlap.

---

## Phase 2: Rings

### Task 2.1: Ring strip generator (pure + script)

**Files:**
- Create: `scripts/generate-ring-strip.ts`, `src/features/solar-system-3d/shaderstrips.ts`
- Test: `tests/unit/ring-strip.test.ts`

**Interfaces:**
- Produces: `sampleRingStrip(kind: "saturn" | "uranus" | "neptune", u: number): { rgb: [number, number, number]; alpha: number }` — a pure function encoding the spec's ring table as a function of normalized radius `u` (0 inner, 1 outer). Saturn: D faint, C `#8f8574` alpha ~0.45, B `#e8dcc0` alpha ~0.95 with fine striping, Cassini gap alpha ~0.05, A `#d9c9a3` alpha ~0.8 with an Encke gap near the outer edge, F thin line. Plus `buildRingStripCanvas(kind, width=2048): HTMLCanvasElement`.

- [ ] **Step 1: Write the failing test** asserting the table: at the Cassini gap's `u`, alpha < 0.1; inside ring B, alpha > 0.85; ring A's Encke gap has a local alpha dip; the strip is a single function (monotonic `u` mapped to the correct bands).

- [ ] **Step 2:** Run, expect FAIL.

- [ ] **Step 3:** Implement the pure sampler from the spec's table, then the canvas builder. The script writes `public/textures/ring-saturn.png` (2048×1), `ring-uranus.png`, `ring-neptune.png`. Run the script once; commit the PNGs.

- [ ] **Step 4:** Run the test, expect PASS.

- [ ] **Step 5:** Commit: `git commit -m "feat: generate the ring strip textures"`.

### Task 2.2: Ring meshes with analytic planet shadow

**Files:**
- Create: `src/features/solar-system-3d/rings.ts`
- Modify: `SolarSystem.ts`

**Interfaces:**
- Consumes: `buildRingStripCanvas`, `BodyDef.ringInner/ringOuter`.
- Produces: `createRings(def, planetWorldRadius): THREE.Mesh` — one `RingGeometry(inner, outer, 256, 1)` with UVs remapped so `u` = normalized radial position, `DoubleSide`, `transparent`, `depthWrite:false`, correct `renderOrder`. A `ShaderMaterial` lights the ring from the Sun side (forward scattering) and computes the **planet's shadow on the rings** analytically (ray–sphere test from each ring fragment toward the Sun, using the planet world position and radius). Added to the `tilt` group, not the `spin` mesh.

- [ ] **Step 1: Write the failing test** (pure): the UV remap function maps a vertex at the inner radius to `u=0` and at the outer radius to `u=1`; the analytic shadow test returns "in shadow" for a ring point directly behind the planet relative to the Sun and "lit" for a point on the Sun side.

- [ ] **Step 2:** Run, expect FAIL.

- [ ] **Step 3:** Implement the geometry UV remap loop and the ring `ShaderMaterial` (planet center/radius and sun direction as uniforms). Saturn (1.67→3.52), Uranus (1.6→2.0), Neptune (1.7→2.4) per the spec.

- [ ] **Step 4:** Run, expect PASS; typecheck + lint.

- [ ] **Step 5:** Commit: `git commit -m "feat: add planet rings with an analytic shadow"`.

**Phase 2 review checkpoint:** Saturn shows structured rings with a visible Cassini gap and a planet shadow; Uranus/Neptune faint rings; tilt visible.

---

## Phase 3: Belts

### Task 3.1: Asteroid belt (InstancedMesh) + Ceres

**Files:**
- Create: `src/features/solar-system-3d/asteroid-belt.ts`
- Modify: `SolarSystem.ts`

**Interfaces:**
- Produces: `createAsteroidBelt(quality): THREE.Group` — 3–4 `InstancedMesh` (one per rock geometry variant, `IcosahedronGeometry` detail 1, vertices displaced) with per-instance attributes (orbit radius 15–19 denser near 17, start angle, vertical scatter ±6°, size 0.01–0.06 power-law, tumble axis+speed, color index). Motion is **GPU-driven** via `onBeforeCompile` computing the orbit position from a `uTime` uniform and per-instance data, with Keplerian speed (`∝ r^−1.5`). Also creates Ceres (own sphere, radius 0.12, `#8d8a85`, bright Occator spots, orbit 17.0, period 45 s). Desktop 6000 / medium 3000 / low 1500 instances.

- [ ] **Step 1: Write the failing test** (pure): instance count matches the quality tier; radii sampled by the generator fall within [15, 19]; the sizes follow the power law (more small than large); the Keplerian speed decreases with radius.

- [ ] **Step 2:** Run, expect FAIL.

- [ ] **Step 3:** Implement. `frustumCulled = false` on the belt meshes. Set the belt group rotation so rocks orbit like the planets.

- [ ] **Step 4:** Run, expect PASS; typecheck + lint.

- [ ] **Step 5:** Commit: `git commit -m "feat: add the asteroid belt and Ceres"`.

### Task 3.2: Kuiper belt hint

**Files:**
- Create: `src/features/solar-system-3d/kuiper-belt.ts`
- Modify: `SolarSystem.ts`

**Interfaces:**
- Produces: `createKuiperBelt(quality): THREE.Points` — sparse icy points (desktop 1500 / low 400), radii 47–58, ±10° scatter, very slow, distance fade so it stays subtle. No dwarf-planet meshes (Haumea, Makemake, Eris are text only in the info area).

- [ ] **Step 1: Write the failing test** (pure): the point count matches the tier; radii fall within [47, 58].

- [ ] **Step 2:** Run, expect FAIL. **Step 3:** Implement. **Step 4:** Run, expect PASS; typecheck + lint.

- [ ] **Step 5:** Commit: `git commit -m "feat: add a sparse Kuiper belt hint"`.

**Phase 3 review checkpoint:** a real thousands-rock belt shears between Mars and Jupiter; Ceres is labeled; the Kuiper hint is subtle; no overlaps.

---

## Phase 4: Moons (tier 2, toggle)

### Task 4.1: Moon system

**Files:**
- Create: `src/features/solar-system-3d/moons.ts`
- Modify: `SolarSystem.ts`

**Interfaces:**
- Produces: `createMoons(def, planetRadius): THREE.Group` for the spec's moons: Earth Moon (0.14, 4 s, tidally locked); Jupiter's Io/Europa/Ganymede/Callisto; Saturn's Titan; Neptune's Triton (retrograde); Pluto's Charon; Mars's Phobos/Deimos. Each moon is a small sphere orbiting inside the planet's `tilt` group; default off, toggled by `toggleMoons`.

- [ ] **Step 1: Write the failing test** (pure): the moon table exists with the spec's radii/periods; a moon's position is computed like a planet's local orbit, with Triton's direction reversed.

- [ ] **Step 2:** Run, expect FAIL. **Step 3:** Implement with a `MoonDef` table inside the module. **Step 4:** Run, expect PASS; typecheck + lint.

- [ ] **Step 5:** Commit: `git commit -m "feat: add moons (tier 2, toggle)"`.

**Phase 4 review checkpoint:** toggling moons on shows the correct satellites; off by default on the low tier.

---

## Phase 5: Post-processing, labels, picking, quality

### Task 5.1: Bloom and quality tiers

**Files:**
- Create: `src/features/solar-system-3d/post.ts`
- Modify: `SolarSystem.ts`

**Interfaces:**
- Produces: `createComposer(renderer, scene, camera, quality): EffectComposer` — on high/medium: `RenderPass` → `UnrealBloomPass` (high threshold so only the Sun blooms) → `OutputPass`; on low: no composer (glow sprite only). `setQuality` swaps composer and instance counts live.

- [ ] **Step 1: Write the failing test** (pure): `shouldUseBloom("high")` true, `("low")` false; the tier table maps each tier to expected belt/kuiper counts and pixel-ratio cap.

- [ ] **Step 2:** Run, expect FAIL. **Step 3:** Implement with the addon import paths verified against three 0.186 (`three/addons/...`). **Step 4:** Run, expect PASS; typecheck + lint. **Step 5:** Commit: `git commit -m "feat: add bloom and per-tier quality"`.

### Task 5.2: Picking, focus and labels

**Files:**
- Create: `src/features/solar-system-3d/picking.ts`, `labels.ts`
- Modify: `SolarSystem.ts`

**Interfaces:**
- Produces: `attachPicking(scene, camera, domElement, proxies)` and `createLabels(container)` using `CSS2DRenderer`. `focus(id)` tweens camera position and `controls.target` with GSAP (~1.2 s, `power2.inOut`) to a distance proportional to the body extent, then follows the body each frame. `resetView()` returns to default framing.

- [ ] **Step 1: Write the failing test** (pure): the focus distance for a body is `k × (radius + ringExtent)`, clamped to the camera's `[minDistance, maxDistance]`; the label visibility rule hides a body when it is behind the Sun relative to the camera.

- [ ] **Step 2:** Run, expect FAIL. **Step 3:** Implement: `Raycaster` against invisible hit proxies (radius ≥ max(real, keeps ~24 px at default zoom)); cursor `pointer`; hover highlights the orbit line and emits `"hover"`; click emits `"select"`. `CSS2DRenderer` overlay for labels with a simple anti-collision pass. **Step 4:** Run, expect PASS; typecheck + lint. **Step 5:** Commit: `git commit -m "feat: add picking, camera focus and labels"`.

### Task 5.3: Adaptive quality and visibility gating

**Files:**
- Modify: `SolarSystem.ts`
- Test: extend `tests/unit/solar-system-scene.test.ts`

**Interfaces:**
- Produces: an FPS probe that steps quality down one tier when the rolling average is below ~45 for 2 s, never stepping up more than once per 10 s; render gated by `IntersectionObserver` (canvas off-screen) and the Page Visibility API; `renderer.info` surfaced in `info`.

- [ ] **Step 1: Write the failing test** (pure): the tier-step function steps down after 2 s under threshold, never steps up within 10 s of a step, and never goes below `"low"`.

- [ ] **Step 2:** Run, expect FAIL. **Step 3:** Implement. **Step 4:** Run, expect PASS; typecheck + lint. **Step 5:** Commit: `git commit -m "feat: add adaptive quality and visibility gating"`.

**Phase 5 review checkpoint:** the Sun blooms alone; hovering highlights an orbit; selecting a body focuses the camera and follows it; FPS probe degrades gracefully; off-screen rendering pauses.

---

## Phase 6: The React page

### Task 6.1: The client wrapper component

**Files:**
- Rewrite: `src/features/solar-system-3d/SolarSystemCanvas.tsx`
- Delete: `src/features/solar-system-3d/scene-source.ts`, `src/features/solar-system-3d/planet-gss.ts`
- Delete tests: `tests/unit/scene-source.test.ts`, `tests/unit/planet-gss.test.ts`, `tests/unit/journey-objects.test.ts` only if they reference the deleted GSS modules (they do not; keep them)

**Interfaces:**
- Consumes: `SolarSystem`, `BODIES`, `bodyById`.
- Produces: `SolarSystemCanvas({ locale, dict })` — a client component that dynamically loads the Three.js class (`await import("./SolarSystem")`, client-only), mounts it on a `<canvas>` ref, mounts the rail, the info card, and the controls, and disposes on unmount. Survives StrictMode double-mount.

- [ ] **Step 1:** Write a jsdom test that the component renders the rail buttons for every body and the failure message when WebGL is unavailable (mock `HTMLCanvasElement.prototype.getContext` to return null) and calls `dispose` on unmount (spy on the class).

- [ ] **Step 2:** Run, expect FAIL.

- [ ] **Step 3:** Implement. The canvas is `role="img"` with a descriptive `aria-label`; the rail is a `<ul>` of `<button>`s; the info card has `aria-live="polite"`; the canvas is created and the scene started in an effect with a cancel flag and full cleanup.

- [ ] **Step 4:** Run, expect PASS; typecheck + lint.

- [ ] **Step 5:** Commit: `git commit -m "feat: add the Three.js React wrapper with rail and info card"`.

### Task 6.2: Controls, copy and the rewrite of the route

**Files:**
- Modify: `src/features/solar-system-3d/SolarSystemCanvas.tsx`, `src/app/[locale]/solar-system-3d/page.tsx`, `src/i18n/en.ts`, `src/i18n/id.ts`

**Interfaces:**
- Produces: controls (play/pause, speed slider wired to `setTimeScale`, "Tampilkan orbit", "Tampilkan bulan", "Tampilkan label", reset view); a progress/poster state until the first frame; the info card with name, type, 4–6 stats, one signature fact, and a "Pelajari lebih lanjut" link to `/{locale}/explore/planet/{slug}` (Sun/Ceres/belt link to the Explore index or a category).

- [ ] **Step 1:** Add the `solarSystem3d.*` dictionary keys (heading, subline stating compression, controls labels, failure message, poster) in both `en` and `id`; run the i18n parity test.

- [ ] **Step 2:** Implement the controls and the info card reading `BodyDef.copy` (Indonesian). Keep the existing route metadata call shape (`routeMetadata(meta, section, path)`).

- [ ] **Step 3:** Verify: `bunx vitest run ; bun run typecheck ; bun run lint ; bun run build` (the route builds for en and id).

- [ ] **Step 4:** Commit: `git commit -m "feat: add the solar system controls, info card and Indonesian copy"`.

**Phase 6 review checkpoint:** the page is fully usable: rail selects a body, the info card shows Indonesian stats with a link, controls work, keyboard path works, no-WebGL shows the failure state.

---

## Phase 7: Tests, docs, deployment

### Task 7.1: Unit tests for the no-overlap invariant and disposal

**Files:**
- Test: `tests/unit/orbit-spacing.test.ts`

- [ ] **Step 1:** Write the test: for adjacent bodies (in orbit order), assert `orbit[i+1] − orbit[i] > extent[i] + extent[i+1]`, where `extent` = `displayRadius` plus the ring outer radius when present plus the farthest moon orbit when moons are enabled. This is the acceptance criterion 2.2 as a guard. Include Ceres and the belt bounds.

- [ ] **Step 2:** Run; expect PASS with the spec values (if it fails, the data table needs a spacing fix, which is a real finding to report, not to paper over).

- [ ] **Step 3:** Commit: `git commit -m "test: guard the no-overlap orbit-spacing invariant"`.

### Task 7.2: Playwright visual checks

**Files:**
- Create: `tests/e2e/solar-system-3d.spec.ts`

- [ ] **Step 1:** Write the spec visiting `/{locale}/solar-system-3d` at 1440×900, 768×1024 and 390×844; asserting the heading, the rail buttons, the info card after selecting a body, and that no console error fires; taking a screenshot per viewport (no floor, whole system framed, Saturn ring visible). The Playwright config already boots the dev server.

- [ ] **Step 2:** Run `bunx playwright test tests/e2e/solar-system-3d.spec.ts` (install chromium first if needed). Expect PASS and inspect the screenshots.

- [ ] **Step 3:** Commit: `git commit -m "test: add Playwright visual checks for the solar system page"`.

### Task 7.3: README, licenses, report, deployment check

**Files:**
- Create: `src/features/solar-system-3d/README.md` (or `docs/solar-system-3d.md`), `public/textures/LICENSES.md` (extend)
- Modify: `docs/runbook.md`

- [ ] **Step 1:** README: pinned three version, how the scene is mounted, how to add a body, texture sources and licenses, quality tiers, known limitations (procedural bodies list). Report section: what was verified in the first-party docs, what was not possible and the fallback used, measured FPS per tier (measure in the browser), final draw-call/triangle counts from `renderer.info`.

- [ ] **Step 2: Deployment check (Vercel).** Confirm: textures under `public/` are served as static assets (no serverless cost); the page is a client island with `ssr:false`, so the server render stays light; total `public/textures` size is within the Vercel per-deployment source limit (well under 2 GB); no `next.config` remote-image domains needed (textures are same-origin). Add a one-paragraph note to `docs/runbook.md` ("Tata Surya 3D: assets statis di `/public/textures`, disajikan CDN edge; tak ada env var tambahan; fallback prosedural bila GPU absen").

- [ ] **Step 3:** Run the full gate: `bunx vitest run ; bun run lint ; bun run typecheck ; bun run build`. Then verify live at `http://localhost:3000/{en,id}/solar-system-3d`.

- [ ] **Step 4:** Commit: `git commit -m "docs: document the solar system page, licenses and deployment"`.

---

## Self-Review

**Spec coverage:**
- Sun + 8 planets + Pluto + Ceres + belts + moons + rings: Phases 1-4.
- Orbits + spins with real tilt and retrograde: Task 1.3.
- Real colors/shape: Tasks 1.4, 1.5, 2, 3.
- No floor, no overlap, whole-system framing: Tasks 1.2, 7.1; acceptance criterion in Phase 7 test.
- Lit by the Sun, day/night: Tasks 1.2, 1.4.
- Performance tiers + adaptive degradation: Tasks 3.1, 5.1, 5.3.
- UI rail + info card + controls + Indonesian copy + accessibility + failure state: Task 6.
- Deliverables (class, bodies, shaders, data, component, ring script, tests, README, report): Phases 0-7.
- Self-host vs remote analysis: the "Textures" section above; self-host chosen with reasons (Vercel performance).

**Recorded decisions:**
- **Vanilla Three.js**, not R3F (spec section 1; the project does not use R3F).
- **Self-host textures** (Vercel performance and reliability).
- **Procedural fallback** for Venus, Mercury, Jupiter, Saturn, Uranus, Neptune (no verified NASA equirectangular texture reachable from this network). The report will name exactly which bodies are textured vs procedural.
- **Camera focus** uses `CSS2DRenderer` labels and a `Raycaster` on hit proxies (Three.js supports this; the GSS limitation does not apply here).
- **Speed slider is live** (vanilla Three.js has no GSS restriction).
- **Pinned** `three@0.186.1` / `@types/three@0.186.0`.

**Placeholder scan:** the only conditional language is "attempt to verify a NASA texture; if none verifies, procedural fallback" (a build-time source check, with the fallback already implemented in Task 1.5), and the ring/quality tables give exact numbers. No code placeholders.

**Type consistency:** `BodyDef`/`BodyId`/`SCALE`/`compressRadius`/`bodyById` defined in Task 0.2 and consumed in Phases 1-6. `SolarSystem`'s public methods defined in Task 1.1 and called in Tasks 5-6. `sampleRingStrip`/`buildRingStripCanvas` defined in Task 2.1 and used in Task 2.2. `proceduralTexture` defined in Task 1.5 and used in Task 1.3's wiring.
