// NASA Trek Web Map Tile Service layers. Tiles are loaded directly by the
// browser from trek.nasa.gov (no API key); this module only builds tile URLs and
// carries provenance. Source: https://trek.nasa.gov
export type TrekBody = "moon" | "mars";

export type TrekLayer = {
  body: TrekBody;
  label: string;
  credit: string;
  sourceUrl: string;
  // {z}/{y}/{x} are substituted with the tile row and column.
  tileTemplate: string;
};

const BASE = "https://trek.nasa.gov/tiles";

export const TREK_LAYERS: Record<TrekBody, TrekLayer> = {
  moon: {
    body: "moon",
    label: "The Moon",
    credit: "NASA / LRO WAC (NASA Trek)",
    sourceUrl: "https://trek.nasa.gov/moon/",
    tileTemplate: `${BASE}/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
  },
  mars: {
    body: "mars",
    label: "Mars",
    credit: "NASA / Viking MDIM21 (NASA Trek)",
    sourceUrl: "https://trek.nasa.gov/mars/",
    tileTemplate: `${BASE}/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
  },
};

export function trekTileUrl(layer: TrekLayer, z: number, y: number, x: number): string {
  return layer.tileTemplate.replace("{z}", String(z)).replace("{y}", String(y)).replace("{x}", String(x));
}

// A z=1 grid is a 2x2 mosaic covering the whole body: enough to show a surface
// without a tile flood.
export function trekGrid(layer: TrekLayer): { z: number; tiles: { url: string; alt: string }[] } {
  const z = 1;
  const tiles: { url: string; alt: string }[] = [];
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      tiles.push({ url: trekTileUrl(layer, z, y, x), alt: `${layer.label} surface, tile ${y}-${x}` });
    }
  }
  return { z, tiles };
}
