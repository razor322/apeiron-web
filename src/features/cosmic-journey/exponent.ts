// The single zoom curve mapping scroll progress (0..1) to an order of magnitude
// in metres. Shared by the scale readout and the ruler marker so the number, the
// marker, and the canvas camera all describe the same moment.
export const MAX_EXPONENT = 27;

const KEYFRAMES: [number, number][] = [
  [0, 0.3],
  [0.07, 0.3],
  [0.17, 5.2],
  [0.28, 7.2],
  [0.38, 7.2],
  [0.5, 9.2],
  [0.57, 9.2],
  [0.68, 11.3],
  [0.74, 11.3],
  [0.86, 13.05],
  [0.9, 13.05],
  [0.94, 21],
  [0.97, 27],
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
