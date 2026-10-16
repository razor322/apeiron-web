# ADR-002: Motion and 3D strategy

- Status: Accepted
- Date: 2026-10-17

## Context

The core experience is one continuous scroll-driven scale zoom across seven
stages. It must feel like one journey, not a stack of animated slides, and it
must stay usable and accessible when motion is unwanted or the graphics stack
is unavailable. The signature element (the scale ruler) has to persist across
every stage.

## Decision

- **One continuous canvas stage driven by GSAP ScrollTrigger.** A single
  `<canvas>` renders the whole zoom; ScrollTrigger maps scroll progress to the
  scene's exponent and the traveling amber marker. `gsap` is already a
  dependency (`^3.15`).
- **CSS gradient + star fallback when canvas/WebGL is unavailable.** If the 2D
  context cannot be created, the scene degrades to nothing and the CSS gradient
  and star field behind the canvas carry the look; the journey still renders.
- **Reduced-motion path stacks stages without pinning.** The calm path renders
  stages in normal single-column flow, no pinning, no scroll animation, and the
  ruler becomes a static readout.
- **Adaptive `quality()` by device.** One place lowers star/blob/galaxy counts
  and caps device pixel ratio on weak (<= 4 core) or narrow (< 768px) devices.
- **Motion preference stored via `src/lib/motion-preference.ts`.** One source
  of truth shared by the global motion toggle and the journey: the OS
  `prefers-reduced-motion` setting, plus a per-device choice under
  `apeiron:motion`. Only the motion choice is stored; no personal data.

## Consequences

- The canvas is decorative (`aria-hidden`). The accessible story lives in the
  DOM text panels, so screen readers and no-canvas environments get the full
  content.
- The reduced-motion path is a first-class view, not a fallback afterthought:
  same copy, same ruler readout, static.
- Motion complexity is contained in the scene module and the motion-preference
  store; both are one seam each.
