# Fact Registry

A human-readable mirror of the code registries. The code remains the single
source of truth:

- `src/features/cosmic-facts/facts.ts` exports `COSMIC_FACTS`.
- `src/features/explorer/planets.ts` exports `PLANETS`.

Every row below was transcribed from those files, not invented. If a value does
not appear in code, it does not appear here. Confidence types follow
`ConfidenceType` in `src/lib/astronomy/models.ts`: `measured`, `estimated`,
`approximate`, or `calculated`, and are rendered as text, never colour alone.

## Scale stages

`COSMIC_FACTS` facts carry a `scaleStage` (`earth`, `solar-system`, `star`,
`galaxy`, `universe`). The journey stages in `src/i18n/en.ts` are hero, earth,
solar-system, star, galaxy, universe, outro. Stages with no registry fact
(hero, galaxy, universe, outro) are listed as such, not padded.

## Journey-stage facts (`COSMIC_FACTS`)

### earth

| id | title | value (SI/display) | unit | confidence | source | source URL | verified |
| --- | --- | --- | --- | --- | --- | --- | --- |
| earth-diameter | Diameter of Earth | 12756 / "12,756" | km | measured | NASA Solar System Exploration | https://science.nasa.gov/earth/facts/ | 2026-10-14 |
| earth-moon-distance | Earth to Moon | 384400 / "384,400" | km | measured | NASA | https://science.nasa.gov/moon/facts/ | 2026-10-14 |

### solar-system

| id | title | value (SI/display) | unit | confidence | source | source URL | verified |
| --- | --- | --- | --- | --- | --- | --- | --- |
| sunlight-earth | Sunlight travel time to Earth | "8 min 20 s" / "8 min 20 s" | (none; time) | calculated | NASA | https://science.nasa.gov/sun/facts/ | 2026-10-14 |
| sun-neptune-light | Sunlight travel time to Neptune | "4.2 h" / "4.2 h" | (none; time) | calculated | NASA | https://science.nasa.gov/neptune/facts/ | 2026-10-14 |

Methodology notes (verbatim from code):

- `sunlight-earth`: Derived from the mean Earth-Sun distance (1 AU, about 149.6 million km) divided by the speed of light (299,792 km/s), giving about 499 seconds.
- `sun-neptune-light`: Derived from Neptune's mean orbital distance (about 30 AU, roughly 4.5 billion km) divided by the speed of light (299,792 km/s), giving about 4.2 hours.

### star

| id | title | value (SI/display) | unit | confidence | source | source URL | verified |
| --- | --- | --- | --- | --- | --- | --- | --- |
| proxima-distance | Distance to Proxima Centauri | 4.24 / "4.24" | light-years | measured | NASA | https://science.nasa.gov/sun/facts/ | 2026-10-14 |

### galaxy, universe, hero, outro

No `COSMIC_FACTS` rows. These stages carry copy only.

## Planet facts (`PLANETS`)

Canonical SI: lengths in metres, periods in seconds, temperature in degrees
Celsius, counts as integers. Numbers follow NASA Solar System Exploration fact
sheets (`science.nasa.gov/<planet>/facts/`), verified 2026-10-16. Every planet
carries the same five `metricKey`s; confidence: `diameter`, `distanceFromSun`,
`orbitalPeriod` = measured; `meanTemp` = approximate; `moons` = estimated.

Source for every planet: NASA Solar System Exploration, verified 2026-10-16.

| planet | source URL | diameter (m) | distanceFromSun (m) | orbitalPeriod (s) | meanTemp (deg C) | moons |
| --- | --- | --- | --- | --- | --- | --- |
| mercury | https://science.nasa.gov/mercury/facts/ | 4879000 | 5.79e10 | 88 * 86400 = 7603200 | 167 | 0 |
| venus | https://science.nasa.gov/venus/facts/ | 12104000 | 1.082e11 | 224.7 * 86400 = 19414080 | 464 | 0 |
| earth | https://science.nasa.gov/earth/facts/ | 12756000 | 1.496e11 | 365.25 * 86400 = 31557600 | 15 | 1 |
| mars | https://science.nasa.gov/mars/facts/ | 6779000 | 2.279e11 | 687 * 86400 = 59356800 | -65 | 2 |
| jupiter | https://science.nasa.gov/jupiter/facts/ | 139820000 | 7.785e11 | 11.9 * 31557600 = 375535440 | -110 | 95 |
| saturn | https://science.nasa.gov/saturn/facts/ | 116460000 | 1.434e12 | 29.4 * 31557600 = 927793440 | -140 | 146 |
| uranus | https://science.nasa.gov/uranus/facts/ | 50724000 | 2.871e12 | 84 * 31557600 = 2650838400 | -195 | 28 |
| neptune | https://science.nasa.gov/neptune/facts/ | 49244000 | 4.495e12 | 165 * 31557600 = 5207004000 | -200 | 16 |

### Display and rounding rules

Planet facts are stored as canonical SI numbers and rendered by
`formatFact` in `src/features/explorer/planets.ts`, which delegates to
`src/lib/astronomy/units/format.ts`:

- `length`: `formatLength` rounds to 3 significant figures (`sig`), then scales
  through m -> km -> million km -> billion km -> light-years (`LIGHT_YEAR` =
  9.4607e15 m).
- `period`: `formatPeriod` shows days below 1000 (`687 days`), else years at 3
  significant figures (`11.9 years`).
- `temperature`: `Intl.NumberFormat` with `maximumFractionDigits: 0`, suffixed
  `\u00B0C`.
- `count`: plain `Intl.NumberFormat`.

The 3-sig-figure `sig` helper is a deliberate deviation from a 2-sig-figure
spec, documented inline in `format.ts`: 2 sig figs would round 384,400 km to
380,000 km.
