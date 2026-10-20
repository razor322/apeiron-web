// Ring strip sampler for the solar system page. The strip is one row of RGBA
// pixels, u running 0 at a planet's inner ring edge to 1 at its outer edge, so
// a ring mesh can sample it by normalized radial position. The Saturn table
// follows the visible ring structure (D, C, B, Cassini division, A with an
// Encke gap, F); Uranus and Neptune get faint, simpler profiles. The values are
// the spec's ring table, expressed as pure functions so the geometry, the test
// and the generated PNG all share one source of truth.

export type RingKind = "saturn" | "uranus" | "neptune";

export type RingSample = {
  rgb: [number, number, number];
  alpha: number;
};

// Hex `#rrggbb` to linear-ish sRGB 0..1 triples; the shader samples in sRGB.
function hex(hexColor: string): [number, number, number] {
  const n = parseInt(hexColor.slice(1), 16);
  return [((n >> 16) & 0xff) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Deterministic value noise in [-1, 1]: a couple of sines at unrelated
// frequencies read as fine radial striping without a PRNG or table.
function striping(u: number, freq: number, phase: number): number {
  return Math.sin(u * freq + phase) * 0.5 + Math.sin(u * freq * 2.37 + phase * 1.7) * 0.5;
}

type Band = {
  start: number;
  end: number;
  color: [number, number, number];
  alpha: number;
  stripe: number;
};

// Piecewise bands over u. Colour and alpha are flat per band; `stripe` adds a
// small radial ripple so dense rings read as granular rather than solid.
const SATURN_BANDS: Band[] = [
  { start: 0.0, end: 0.08, color: hex("#7a7266"), alpha: 0.12, stripe: 0.03 }, // D, faint
  { start: 0.08, end: 0.3, color: hex("#8f8574"), alpha: 0.45, stripe: 0.05 }, // C
  { start: 0.3, end: 0.64, color: hex("#e8dcc0"), alpha: 0.95, stripe: 0.06 }, // B, bright
  { start: 0.64, end: 0.73, color: hex("#5a5346"), alpha: 0.05, stripe: 0.01 }, // Cassini gap
  { start: 0.73, end: 0.96, color: hex("#d9c9a3"), alpha: 0.8, stripe: 0.05 }, // A
  { start: 0.96, end: 1.0, color: hex("#cbbfa0"), alpha: 0.35, stripe: 0.03 }, // F, thin
];

// A narrow Encke gap in the outer part of ring A.
const ENCKE = { center: 0.9, halfWidth: 0.012, alpha: 0.08 };

const URANUS_BANDS: Band[] = [
  { start: 0.0, end: 0.55, color: hex("#9fb8bd"), alpha: 0.05, stripe: 0.02 },
  { start: 0.55, end: 0.7, color: hex("#bcd3d6"), alpha: 0.35, stripe: 0.04 },
  { start: 0.7, end: 0.85, color: hex("#9fb8bd"), alpha: 0.18, stripe: 0.03 },
  { start: 0.85, end: 1.0, color: hex("#bcd3d6"), alpha: 0.45, stripe: 0.05 },
];

const NEPTUNE_BANDS: Band[] = [
  { start: 0.0, end: 0.4, color: hex("#6f78a8"), alpha: 0.04, stripe: 0.02 },
  { start: 0.4, end: 0.6, color: hex("#8f96c4"), alpha: 0.3, stripe: 0.04 },
  { start: 0.6, end: 0.82, color: hex("#8f96c4"), alpha: 0.15, stripe: 0.03 },
  { start: 0.82, end: 1.0, color: hex("#9aa0cc"), alpha: 0.35, stripe: 0.05 },
];

const TABLES: Record<RingKind, Band[]> = {
  saturn: SATURN_BANDS,
  uranus: URANUS_BANDS,
  neptune: NEPTUNE_BANDS,
};

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function sampleRingStrip(kind: RingKind, u: number): RingSample {
  const uc = clamp01(u);
  const bands = TABLES[kind];

  let band: Band = bands[0]!;
  for (const b of bands) {
    if (uc >= b.start && uc < b.end) {
      band = b;
      break;
    }
  }

  const ripple = striping(uc, 90, kind === "saturn" ? 0 : kind === "uranus" ? 1.3 : 2.6) * band.stripe;
  let alpha = clamp01(band.alpha + ripple);

  // Fine striping only bites where a band is already fairly opaque, so gaps
  // stay clean.
  if (band.alpha > 0.4) {
    alpha = clamp01(alpha + striping(uc, 260, 0.5) * 0.04);
  }

  if (kind === "saturn") {
    const d = Math.abs(uc - ENCKE.center);
    if (d < ENCKE.halfWidth) {
      const t = d / ENCKE.halfWidth;
      alpha = mix(ENCKE.alpha, alpha, t);
    }
  }

  return { rgb: band.color, alpha };
}
