# Apeiron Runbook

Operational procedures for the Apeiron MVP. Every path is relative to the repo root.

## Update a fact

Facts live in one registry: `src/features/cosmic-facts/facts.ts` (`COSMIC_FACTS`).

1. Edit or add the entry. Keep all of these fields, or the number is not shown:
   - `sourceName` and `sourceUrl`: where the number comes from,
   - `verifiedAt`: the date you checked the source (`YYYY-MM-DD`),
   - `confidenceType`: `measured`, `estimated`, `approximate`, or `calculated`,
   - `unit` and `displayValue`, plus `methodologyNote` when `calculated`.
2. If the fact is `calculated`, state the formula and inputs in `methodologyNote`.
3. Update `verifiedAt` to today and confirm the source URL still resolves.
4. Run `bun run test tests/unit/facts.test.ts` to check the registry is well-formed.

## Change a cache TTL

TTLs are declared per adapter, next to the code that uses them.

- APOD: `APOD_TTL_MS` in `src/lib/astronomy/providers/nasa-apod.ts`
  (currently `6 * 3600_000`, six hours).
- The cache itself is `src/lib/cache/ttl-cache.ts` (`cached(key, ttlMs, fetcher)`),
  an in-process TTL map with stale-on-error fallback. Do not change it to alter a
  TTL; change the constant in the adapter.

After editing, run `bun run test tests/unit/ttl-cache.test.ts` and, if the adapter
has integration coverage, `bun run test tests/integration/apod.test.ts`.

## Fix a provider

Each provider is one adapter behind one stable interface. If a source changes:

1. Edit only the adapter, e.g. `src/lib/astronomy/providers/nasa-apod.ts`, and
   its validation schema under `src/lib/astronomy/schemas/` if the response
   shape moved. Keep mapping the raw response onto the internal model so the UI
   never sees a provider shape.
2. Update that adapter's tests in the same change:
   `tests/integration/apod.test.ts` and, if the mapping changed,
   `tests/unit/apod-card.test.tsx`.
3. Never let a raw provider field leak past the adapter. The UI reads only the
   `AstronomySnapshot<T>` wrapper (data + provenance: provider, sourceUrl,
   retrievedAt, stale).
4. If the provider is down, the adapter returns the last snapshot with
   `stale: true`; the UI shows the stored value with its date. Do not remove
   that fallback.

## Roll back a release

1. Identify the last good commit:
   `git log --oneline` (this repo's releases are commits on `master`).
2. Revert the bad change without rewriting history:
   `git revert <bad-sha>` and push the revert commit.
3. If the failure is only the deployed build, redeploy the previous commit on the
   host instead of reverting: roll the deployment back to the prior build artifact.
4. If the failure is a provider outage, no rollback is needed: the adapter's
   stale fallback covers it. Clear the cache only if a bad entry was cached:
   the store is in-process, so a restart empties it.
5. After rolling back, run the full gate below before re-releasing.

## Pre-launch go/no-go checklist (PRD section 12)

Run in order and record output. All must PASS.

**Gate commands:**

```bash
bun run lint && bun run typecheck && bun run test && bun run test:e2e && bun run build
```

**Product**
- [ ] Seven journey stages are completable.
- [ ] The progress indicator navigates to a chosen stage.
- [ ] Key facts show a unit and a clear source.
- [ ] The topic grid ships with curated seed content.
- [ ] Cosmos Today shows APOD content, or a clear fallback on provider failure.
- [ ] The about/sources page explains visualization methodology and image rights.

**Data and trust**
- [ ] Every published quantitative number carries a verified source.
- [ ] Every image has alt text and a reviewed credit.
- [ ] Nothing is labelled "live" unless it is live.
- [ ] Cache, timestamp, provider error, and fallback are tested.
- [ ] No private API key in client code or the repository.

**Accessibility and performance**
- [ ] The core experience works with reduced motion enabled.
- [ ] Primary navigation and controls are keyboard-usable.
- [ ] Content stays readable when WebGL is off or fails.
- [ ] Layout tested at narrow mobile, tablet, laptop, desktop.
- [ ] Core Web Vitals measured; critical issues handled before release.

**Technical quality**
- [ ] Unit tests for unit formatters, fact data, and calculators.
- [ ] Integration tests for live providers, including invalid response and timeout.
- [ ] End-to-end tests for the main journey and reduced-motion fallback.
- [ ] Production build succeeds and environment docs exist.
