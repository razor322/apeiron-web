# Context: Apeiron

Domain glossary for Apeiron, a Bahasa-Indonesia-capable (English default) scrollytelling site that teaches cosmic scale from Earth to the observable universe. Terms here name the real modules and seams; architecture reviews and the plan (`docs/superpowers/plans/2026-10-15-apeiron-mvp.md`) use these names.

## Domain concepts

- **Cosmic Journey**: the product's core experience, seven stages (hero, earth, solar-system, star, galaxy, universe, outro) travelled as one continuous scroll-driven scale zoom. Owns the signature element, the **Scale Ruler**.
- **Stage**: one step of the Cosmic Journey. A stage has copy, an exponent (its order of magnitude), and zero or more linked facts.
- **Scale Ruler**: the single vertical logarithmic ruler that persists across every stage and moves one amber marker outward as the reader travels. The site's one bold device; everything else stays quiet.
- **CosmicFact**: a curated, sourced quantitative statement (value, unit, confidence type, source, verification date). Single source of truth lives in the facts registry.
- **Confidence type**: how a fact's number is known, one of `measured`, `estimated`, `approximate`, or `calculated`. Rendered as text, never colour alone.
- **Explorer**: the grid of eight object categories (planet, star, black-hole, nebula, galaxy, exoplanet, comet-asteroid, dark-matter) and the reusable topic-detail page.
- **Cosmos Today**: the daily astronomy image/explanation surface, fed by the APOD provider.
- **Calculator**: an educational estimator (planet age, travel time) that always shows its formula and assumptions.

## Architecture concepts (codebase-design vocabulary)

- **Provider adapter**: a module that fetches, validates, and maps one external source (APOD, NASA Images, JPL, Exoplanet Archive) behind one stable internal interface. Each adapter is a **seam**: exactly one external source behind it. Two providers sharing a pattern is when a shared seam is real.
- **Snapshot**: the provider-independent wrapper (`AstronomySnapshot<T>`) carrying data plus provenance: provider, source URL, retrieval time, computed-for time, stale flag, attribution. The interface UI reads; it never sees a raw provider shape.
- **Cache**: the TTL store with stale fallback between adapters and the network. Its interface is small (key, ttl, fetcher) and it hides freshness, storage, and error-fallback policy.
- **Locale / Dictionary**: `Locale` is `"en" | "id"`; a `Dictionary` is the typed copy for one locale. Dictionaries are the only place UI copy lives; components receive a `dict` rather than holding strings.
- **Design plan**: `docs/design/design-plan.md`, the palette, type roles, layout logic, and the signature element, written before any CSS.

## Conventions

- All source under `src/`; `@/*` maps to `./src/*`; tests under `tests/` at the repo root.
- UI never reads a raw provider response; only adapters do, and only through a validated schema.
- Every published number carries a source, unit, verification date, and confidence type, or it is not shown.
