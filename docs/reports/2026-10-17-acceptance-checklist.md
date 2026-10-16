# Apeiron MVP Acceptance Checklist

Date: 2026-10-17
Scope: P0 acceptance criteria for the M6 release candidate, mapped from `docs/apeiron-roadmap.md`
(sections 3-10 and the backlog table in section 11). Every item is marked Pass, Partial, or
Manual. Pass and Partial cite the test, command, or source path that proves it. Manual items need
a live environment and name the exact step.

Evidence gates on this machine:

```bash
bun run lint && bun run typecheck && bun run test && bun run build
```

## Summary

| Status  | Count |
|---------|-------|
| Pass    | 21    |
| Partial | 2     |
| Manual  | 6     |

Go/no-go: **GO with manual items outstanding.** Every P0 acceptance criterion in code (lint,
typecheck, unit/integration tests, production build) passes. The Manual rows below (deploy
preview, production env vars, HTTP caching, monitoring, favicon at the host) are pre-launch
release steps the operator must clear, and none block the release candidate itself.

## Product and content

| ID | Criterion (roadmap) | Status | Evidence |
|----|---------------------|--------|----------|
| AP-001 | Next.js, TypeScript, lint, test, build pipeline works | Pass | `package.json` scripts; `.github/workflows/ci.yml`; `bun run build` succeeds |
| AP-002 | Design tokens and core components, responsive | Pass | `tests/unit/tokens.test.ts`; `tests/e2e/responsive.spec.ts` |
| AP-003 | Asset register and fact registry with sources | Pass | `docs/content/fact-registry.md`; `tests/unit/facts.test.ts`; `tests/unit/planet-images.test.ts` |
| AP-004 | Seven-stage Cosmic Journey with working progress | Pass | `tests/unit/journey-progress.test.ts`; `tests/e2e/journey.spec.ts` |
| AP-005 | Reduced-motion journey without aggressive pinning | Pass | `tests/e2e/journey.spec.ts` (reduced branch); `docs/reports/2026-10-17-qa-perf.md` |
| AP-010 | Explorer grid, eight categories with seed content | Pass | `tests/unit/explorer.test.tsx`; `tests/e2e/responsive.spec.ts` |
| AP-011 | Cosmos Today shows APOD or a clear fallback | Pass | `tests/integration/apod.test.ts`; `tests/unit/apod-card.test.tsx`; `src/features/cosmos-today/ApodFallback.tsx` |
| AP-012 | About, Sources, Methodology page explains method and credit | Pass | `src/app/[locale]/about/page.tsx`; `tests/e2e/full-flow.spec.ts` |
| AP-013 | SEO metadata per route and Open Graph default | Pass | `tests/unit/metadata.test.ts`; `src/lib/seo.ts` |
| AP-016 | Reusable topic detail template | Pass | `src/app/[locale]/explore/[slug]/page.tsx`; `tests/unit/planet-detail.test.tsx` |

## Data, trust, and providers

| ID | Criterion (roadmap) | Status | Evidence |
|----|---------------------|--------|----------|
| AP-006 | Data model, schema, one internal provider interface | Pass | `src/lib/astronomy/models.ts`; `tests/integration/nasa-images.test.ts` |
| AP-007 | APOD integration: data, attribution, cache, fallback pass tests | Pass | `tests/integration/apod.test.ts`; `tests/integration/apod-route.test.ts`; `src/lib/astronomy/providers/nasa-apod.ts` |
| AP-008 | NASA Image Library integration, mapped and tested | Pass | `tests/integration/nasa-images.test.ts`; `tests/integration/images-route.test.ts` |
| AP-009 | API error state, cache, provider logging proven for timeout/rate-limit/fallback | Pass | `tests/unit/log.test.ts`; `tests/unit/ttl-cache.test.ts`; `RateLimitError` in `nasa-apod.ts` |
| AP-017 | Sourced fact strip (Numbers) | Pass | `tests/unit/numbers.test.tsx`; `src/app/[locale]/numbers/page.tsx` |
| AP-018 | Cosmic Calendar with sources and notes | Pass | `tests/unit/cosmic-calendar.test.ts`; `src/app/[locale]/calendar/page.tsx` |
| AP-019 | "You are made of stardust" content reviewed | Partial | `tests/unit/stardust.test.tsx`; scientific review sign-off not recorded |
| AP-020 | Planet-age calculator shows formula and orbit period | Pass | `tests/unit/calculators.test.tsx` |
| AP-021 | Travel-time calculator shows assumptions and limits | Pass | `tests/unit/calculators.test.tsx` |
| - | No private API key in client code or repo | Pass | `NASA_API_KEY` read server-side only in `nasa-apod.ts`; CI workflow references no secret; no `NEXT_PUBLIC_` key |

## Accessibility, performance, and quality

| ID | Criterion (roadmap) | Status | Evidence |
|----|---------------------|--------|----------|
| AP-014 | Responsive / performance QA, no blocker on target devices | Pass | `tests/e2e/responsive.spec.ts`; `docs/reports/2026-10-17-qa-perf.md` |
| AP-015 | Keyboard and accessibility QA, core flow usable without mouse | Pass | `tests/e2e/a11y.spec.ts`; `tests/unit/ui-states.test.tsx` |
| - | Reduced motion works with OS setting and app toggle | Pass | `src/lib/motion-preference.ts`; `docs/reports/2026-10-17-qa-perf.md` |
| - | Content stays readable when WebGL is off or fails | Pass | `tests/e2e/a11y.spec.ts` (WebGL-disabled check) |
| - | Meta tags, canonical, Open Graph, favicon verified | Partial | metadata + alternates tested; canonical and favicon verification is a host check (Manual below) |
| - | Core Web Vitals measured; critical issues handled | Manual | Reporter logs to console (`src/components/perf/WebVitalsReporter.tsx`); field measurement needs the deployed preview |
| - | End-to-end tests for main journey and reduced-motion fallback | Pass | `tests/e2e/journey.spec.ts`; `tests/e2e/full-flow.spec.ts` |

## Manual release steps (need a live environment)

| Step | Owner action | Why manual |
|------|--------------|------------|
| Deploy preview + production | Run the host deploy on the chosen commit, then load the preview URL and walk hero -> stages -> topic -> sources -> Cosmos Today | Requires the hosting account; deploy stays manual by design |
| Verify production environment variables | Set `NASA_API_KEY` and `NEXT_PUBLIC_SITE_URL` in the production environment, then confirm Cosmos Today returns a live image (not DEMO_KEY) | Env vars are set in the host, never committed |
| Verify HTTP caching and invalidation | Confirm the Cosmos Today route serves with `revalidate = 21600` and refreshes within 6h on the host | ISR behavior is host-observed |
| Add monitoring | Wire an error collector for client/server errors without collecting unnecessary data | No collector exists until the host is chosen |
| Verify favicon and canonical on the deployed host | Load `/en` and `/id`, check `<link rel="icon">` and the canonical URL | Rendered by the host, not unit-testable |
| Record AP-019 scientific review | Have a reviewer sign off the stardust content, then flip this row to Pass | Human review step |

## Rollback

See `docs/runbook.md` ("Roll back a release"). The candidate is a commit on `master`, so rollback
is `git revert <sha>` or a redeploy of the previous build artifact.
