import type { AstronomyMedia } from "@/lib/astronomy/models";

// One real NASA image per journey stage, for the calm (reduced-motion) path,
// where the canvas does not run. Each URL was HEAD-verified (image/jpeg) from the
// NASA Image and Video Library. The hero and outro stay typographic, so they have
// no entry.
const BASE = "https://images-assets.nasa.gov/image";
const DETAIL = "https://images.nasa.gov/details";

function media(id: string, variant: string, title: string, credit: string, altText: string): AstronomyMedia {
  const url = `${BASE}/${id}/${id}~${variant}.jpg`;
  return {
    id,
    title,
    mediaType: "image",
    previewUrl: url,
    originalUrl: url,
    sourceName: "NASA Image and Video Library",
    sourceUrl: `${DETAIL}/${id}`,
    credit,
    rightsNote: "NASA material is generally not copyrighted.",
    altText,
    retrievedAt: "2026-10-17",
  };
}

export const JOURNEY_IMAGES: Record<string, AstronomyMedia> = {
  mid: media(
    "sl4-143-4707",
    "medium",
    "Earth from orbit",
    "NASA",
    "Earth seen from orbit, blue ocean and white clouds against black space.",
  ),
  earth: media(
    "GSFC_20171208_Archive_e001386",
    "medium",
    "Earth",
    "NASA",
    "Earth, the Blue Marble, showing oceans and swirling cloud systems.",
  ),
  "solar-system": media(
    "PIA12365",
    "orig",
    "The Solar System",
    "NASA/JPL",
    "A montage of the planets of the Solar System.",
  ),
  star: media(
    "PIA26681",
    "medium",
    "The Sun",
    "NASA/JPL-Caltech",
    "The Sun, a sphere of glowing plasma.",
  ),
  galaxy: media(
    "PIA20970",
    "orig",
    "A galaxy",
    "NASA/JPL-Caltech",
    "A spiral galaxy of stars, gas, and dust seen at an angle.",
  ),
  universe: media(
    "PIA12110",
    "medium",
    "Deep field",
    "NASA/JPL-Caltech",
    "A deep field of distant galaxies scattered across the dark sky.",
  ),
};

export function getJourneyImage(stageId: string): AstronomyMedia | undefined {
  return JOURNEY_IMAGES[stageId];
}
