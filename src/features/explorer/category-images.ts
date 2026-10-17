import type { AstronomyMedia } from "@/lib/astronomy/models";

// One curated, public-domain NASA image per explorer category. Static by design:
// the Explorer must render without a network call. Each URL was HEAD-verified
// (HTTP 200, image/jpeg) from the NASA Image and Video Library. The dynamic
// searchNasaImage adapter can enrich these later; this is the reliable floor.
const IMAGE_BASE = "https://images-assets.nasa.gov/image";
const DETAIL_BASE = "https://images.nasa.gov/details";

function asset(id: string): { preview: string; source: string } {
  return { preview: `${IMAGE_BASE}/${id}/${id}~medium.jpg`, source: `${DETAIL_BASE}/${id}` };
}

const entries: Array<{
  slug: string;
  id: string;
  title: string;
  credit: string;
  altText: string;
}> = [
  {
    slug: "planet",
    id: "GSFC_20171208_Archive_e001386",
    title: "Earth",
    credit: "NASA",
    altText: "Earth from space, the Blue Marble, showing oceans and swirling cloud systems.",
  },
  {
    slug: "star",
    id: "PIA18906",
    title: "The Sun",
    credit: "NASA/JPL-Caltech/GSFC",
    altText: "The Sun imaged in high-energy X-rays, bright against a dark background.",
  },
  {
    slug: "black-hole",
    id: "PIA23122",
    title: "Messier 87",
    credit: "NASA/JPL-Caltech/IPAC",
    altText: "The galaxy Messier 87, home to the first black hole ever imaged, seen by Spitzer.",
  },
  {
    slug: "nebula",
    id: "carina_nebula",
    title: "Carina Nebula",
    credit: "NASA, ESA, CSA, STScI",
    altText: "The Cosmic Cliffs of the Carina Nebula, pillars of gas and dust, from the James Webb Space Telescope.",
  },
  {
    slug: "galaxy",
    id: "PIA04921",
    title: "Andromeda",
    credit: "NASA/JPL-Caltech",
    altText: "The Andromeda galaxy, a spiral of stars and dust seen at an angle.",
  },
  {
    slug: "exoplanet",
    id: "PIA21473",
    title: "A red dwarf and its planet",
    credit: "NASA/JPL-Caltech",
    altText: "An illustration of a flaring red dwarf star with a planet in the foreground.",
  },
  {
    slug: "comet-asteroid",
    id: "PIA21068",
    title: "Comet 67P",
    credit: "ESA/Rosetta/MPS for OSIRIS Team",
    altText: "The comet 67P/Churyumov-Gerasimenko, a dark, irregular body of ice and dust.",
  },
  {
    slug: "dark-matter",
    id: "PIA07906",
    title: "The Virgo cluster",
    credit: "NASA/JPL-Caltech",
    altText: "The Virgo galaxy cluster, whose motions reveal the unseen mass of dark matter.",
  },
];

export const CATEGORY_IMAGES: Record<string, AstronomyMedia> = Object.fromEntries(
  entries.map((e) => {
    const { preview, source } = asset(e.id);
    return [
      e.slug,
      {
        id: e.slug,
        title: e.title,
        mediaType: "image" as const,
        previewUrl: preview,
        originalUrl: preview,
        sourceName: "NASA Image and Video Library",
        sourceUrl: source,
        credit: e.credit,
        rightsNote: "NASA material is generally not copyrighted.",
        altText: e.altText,
        retrievedAt: "2026-10-17",
      } satisfies AstronomyMedia,
    ];
  }),
);

export function getCategoryImage(slug: string): AstronomyMedia | undefined {
  return CATEGORY_IMAGES[slug];
}
