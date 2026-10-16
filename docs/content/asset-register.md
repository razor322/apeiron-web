# Asset Register

A human-readable mirror of the shipped imagery. The code remains the single
source of truth: `src/features/explorer/planet-images.ts` exports
`PLANET_IMAGES` (one curated, public-domain NASA image per planet). Every URL
and credit below matches that file exactly; none were invented.

Today the site ships eight static planet images. The APOD image of the day is
not a shipped asset: it is fetched daily by a provider, handled separately and
credited per entry (see `docs/APOD-APIs-and-RSS-info.md` and the About page
source table in `src/i18n/en.ts`).

## Shipped images (`PLANET_IMAGES`)

All eight were HEAD-verified on 2026-10-17: HTTP 200 with an image content type.

| asset id | description | original URL | credit | rights note | alt text | used in |
| --- | --- | --- | --- | --- | --- | --- |
| mercury | Mercury, the smallest planet | https://science.nasa.gov/wp-content/uploads/2023/11/mercury-messenger-globe-pia15162.jpg | NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington | NASA material is generally not copyrighted. | Mercury, the smallest planet, in a global view from NASA's MESSENGER mission. | planet detail page (`/explore/planet/mercury`) |
| venus | Venus in a global view | https://science.nasa.gov/wp-content/uploads/2023/05/venus-single.png | NASA/JPL-Caltech | NASA material is generally not copyrighted. | Venus in a global view, its thick clouds hiding the surface below. | planet detail page (`/explore/planet/venus`) |
| earth | Satellite view of Earth | https://science.nasa.gov/wp-content/uploads/2024/03/gsfc-20171208-archive-e001997orig.jpg | ISS Astronaut/Earth Observatory | NASA material is generally not copyrighted. | A satellite view of Earth peering down on the ocean with a phytoplankton bloom and bright white clouds. | planet detail page (`/explore/planet/earth`) |
| mars | Global view of Mars | https://science.nasa.gov/wp-content/uploads/2024/03/pia04304-mars.jpg | NASA/USGS | NASA material is generally not copyrighted. | A global view of Mars showing a large crater across the middle of the red planet. | planet detail page (`/explore/planet/mars`) |
| jupiter | One side of Jupiter with the Great Red Spot | https://science.nasa.gov/wp-content/uploads/2024/03/jupiter-marble-pia22946.jpg | NASA/JPL-Caltech/SwRI/MSSS; processed by Kevin M. Gill (CC-BY) | Processed by Kevin M. Gill, used under CC-BY (attribution required). | A view of one side of Jupiter showing its Great Red Spot and tan, orange, and white cloud bands. | planet detail page (`/explore/planet/jupiter`) |
| saturn | Saturn and its rings from Cassini | https://science.nasa.gov/wp-content/uploads/2023/05/pia05380-saturn-with-rings-16x9-1.jpg | NASA/JPL/Space Science Institute | NASA material is generally not copyrighted. | A view of Saturn from NASA's Cassini spacecraft showing the planet's ring system. | planet detail page (`/explore/planet/saturn`) |
| uranus | Uranus seen by the James Webb Space Telescope | https://science.nasa.gov/wp-content/uploads/2024/05/webb-stsci-01hhfp5g5bxsc5m7dx6dg9yxmb.png | NASA, ESA, CSA, STScI | NASA material is generally not copyrighted. | Uranus as seen by the James Webb Space Telescope, its pale blue disk and faint rings. | planet detail page (`/explore/planet/uranus`) |
| neptune | Neptune in full disk view | https://science.nasa.gov/wp-content/uploads/2024/03/pia01492-neptune-full-disk-16x9-1.jpg | NASA/JPL | NASA material is generally not copyrighted. | Neptune in full disk view, blue and banded with clouds and storms. | planet detail page (`/explore/planet/neptune`) |

Retrieval date recorded in code for all eight: 2026-10-16.

## Verification

HEAD-verified 2026-10-17. All eight URLs returned HTTP 200 with an image
content type (`image/jpeg` for mercury, earth, mars, jupiter, saturn, neptune;
`image/png` for venus, uranus).

## APOD (daily provider, not a shipped asset)

The Cosmos Today image is fetched at request time from the NASA APOD provider,
not stored in the repository. Its credit and rights are carried per entry and
surfaced by the UI; NASA APOD is public domain unless the entry credits an
author. Source handling rules live in `docs/APOD-APIs-and-RSS-info.md`.
