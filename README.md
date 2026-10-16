# Apeiron

A scroll-driven site about the scale of the cosmos, from a point of light to the
observable universe, one order of magnitude at a time. English by default with a
Bahasa Indonesia locale under `/id`.

- `/en`: the Cosmic Journey (seven stages, the scale ruler)
- `/en/explore`: eight object categories and their topic pages
- `/en/cosmos-today`: the NASA APOD image of the day with its explanation
- `/en/about`: data sources, methodology, image rights, limitations

## Prerequisites

- [Bun](https://bun.sh) 1.2.x (`packageManager` pins `bun@1.2.22`)
- Node 20+ (Next 16 needs it; Bun runs the scripts)
- Playwright's Chromium for the e2e suite: `bunx playwright install chromium`

## Setup

```bash
bun install
cp .env.example .env.local
```

`.env.local` is read by the server only. Fill in:

| Variable | Purpose | Default |
| --- | --- | --- |
| `NASA_API_KEY` | NASA APOD access (server-only, never `NEXT_PUBLIC_`) | `DEMO_KEY` |
| `JPL_USER_AGENT` | Identifies this client to JPL endpoints | `apeiron-mvp/0.1 (contact@example.com)` |

`DEMO_KEY` works for light use; request a free key at
https://api.nasa.gov for real traffic.

## Commands

| Command | Does |
| --- | --- |
| `bun run dev` | Dev server at http://localhost:3000 |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run lint` | ESLint |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | Unit and integration tests (Vitest) |
| `bun run test:watch` | Vitest in watch mode |
| `bun run test:e2e` | Playwright e2e (starts `bun run dev` itself) |
| `bun run format` | Prettier write |

## Deployment

The app is a standard Next.js server deploy (adapters call external APIs at
request time and read `NASA_API_KEY` from the server env, so it is not a static
export). Before going live on the chosen host tier, verify:

- **Build**: the tier runs a Next 16 build with Turbopack and Node 20+.
- **Function**: serverless functions get a runtime >= the adapter fetch timeout
  (8s in `src/lib/astronomy/providers/nasa-apod.ts`); each route stays under the
  tier's execution limit.
- **Bandwidth**: image traffic for Cosmos Today flows from the provider CDN, not
  the host, so the host only serves HTML/JS/CSS. Confirm the tier's egress
  covers the expected page weight.
- **Cache**: the APOD cache is an in-process TTL map
  (`src/lib/cache/ttl-cache.ts`), so it is per-instance, not shared. On a
  multi-instance tier each instance warms its own copy once per TTL; that is
  acceptable and no external cache is required. If a host requires a shared
  cache or ISR revalidation, wire it in the adapter, not the UI.

Set `NASA_API_KEY` and `JPL_USER_AGENT` in the host's server environment.

## Project layout

- `src/app/[locale]/`: routes; locale lives only in the path prefix
- `src/features/`: journey, explorer, cosmos-today, calculators, cosmic-facts
- `src/lib/astronomy/`: provider adapters, schemas, models
- `src/i18n/`: typed dictionaries (`en`, `id`); all UI copy lives here
- `tests/`: Vitest (`tests/unit`, `tests/integration`) and Playwright (`tests/e2e`)
- `docs/`: PRD, roadmap, design plan, runbook
