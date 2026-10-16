# ADR-001: Product stack

- Status: Accepted
- Date: 2026-10-17

## Context

Apeiron is a scrollytelling site that teaches cosmic scale, in a quiet
observational visual language, from a point of light to the observable
universe. It needs to ship fast, render mostly-static editorial pages, hold a
few live provider surfaces (APOD, NASA Images), and keep every number sourced
and typed. The team is small and the codebase should stay small too.

## Decision

- **Framework: Next.js 16.4.1 (App Router) + TypeScript strict.** Static
  editorial pages and streaming server components for provider-backed
  surfaces, from one framework.
- **Styling: Tailwind v4 CSS-first with a closed token palette.** The design
  plan pins four core tokens plus one accent; tokens, not ad-hoc values, keep
  the palette closed.
- **Structure: feature-driven `src/features/*` with adapters under
  `src/lib/astronomy`.** Each external source sits behind one provider adapter;
  features own their UI, adapters own the network seam.
- **zod-validated provider boundaries.** Every provider response is parsed
  through a schema before it reaches the app, so a malformed source fails at
  the seam, not in the UI.
- **Package manager: bun.** Fast installs and script running; the repo pins
  `bun@1.2.22`.
- **Testing: Vitest (unit) + Playwright (end-to-end).** Vitest for adapter and
  logic tests, Playwright for the scroll journey and real page behaviour.

## Consequences

- One framework covers both static editorial and dynamic provider surfaces;
  no second build tool.
- The closed token palette is enforceable and auditable.
- Provider shapes never leak into the UI: only adapters read a raw response,
  and only through a validated schema.
- TypeScript strict plus zod means boundary errors surface early, at some cost
  in upfront typing.
- bun is the required package manager; contributors need it installed.
