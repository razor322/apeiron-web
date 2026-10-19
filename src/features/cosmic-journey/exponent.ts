// The single zoom curve mapping scroll progress (0..1) to an order of magnitude
// in metres. Shared by the scale readout and the ruler marker so the number, the
// marker, and the canvas camera all describe the same moment.
export const MAX_EXPONENT = 27;

const KEYFRAMES: [number, number][] = [
  [0, 0.3],
  [0.06, 0.3],
  [0.14, 5.2],
  [0.2, 6.8],
  [0.34, 7.2],
  [0.4, 9.2],
  [0.52, 11.3],
  [0.58, 13.0],
  [0.7, 16.0],
  [0.76, 18.0],
  [0.84, 21.0],
  [0.9, 24.5],
  [0.94, 27],
  [1, 27],
];

export function exponentAtProgress(progress: number): number {
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const [p0, e0] = KEYFRAMES[i]!;
    const [p1, e1] = KEYFRAMES[i + 1]!;
    if (progress <= p1) {
      const t = Math.min(1, Math.max(0, (progress - p0) / (p1 - p0)));
      return e0 + (e1 - e0) * (t * 0.35 + t * t * (3 - 2 * t) * 0.65);
    }
  }
  return MAX_EXPONENT;
}

// The smallest progress whose curve value reaches at least `target`. Used to
// place each stage's scroll window on the curve, so the ruler label, the stage
// copy, and the canvas camera all describe the same moment.
export function progressAtExponent(target: number): number {
  const step = 0.001;
  for (let p = 0; p <= 1; p += step) {
    if (exponentAtProgress(p) >= target) return Math.min(1, p);
  }
  return 1;
}
