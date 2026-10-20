import * as THREE from "three";
import { seededRandom } from "./sun";
import { SCALE } from "./solar-system.data";

// The Kuiper belt hint: a sparse shell of icy points beyond Neptune, kept
// deliberately faint so it reads as a distant suggestion rather than a feature.
// Unlike the asteroid belt the points barely move and are never lit, so a plain
// (non instanced) Points cloud with a distance fade is all it needs.

export type Quality = "low" | "medium" | "high";

const TWO_PI = Math.PI * 2;
const DEG2RAD = Math.PI / 180;

// The points scatter within +/-10 degrees of the ecliptic.
export const KUIPER_SCATTER_DEG = 10;

export function kuiperCounts(quality: Quality): number {
  if (quality === "high") return 1500;
  if (quality === "medium") return 800;
  return 400;
}

export type KuiperData = {
  count: number;
  positions: Float32Array;
  colors: Float32Array;
};

// Builds the point positions and a per-point brightness. Pure given the seed so
// the layout is stable and testable without a WebGL context.
export function sampleKuiper(quality: Quality, seed = 20261020): KuiperData {
  const count = kuiperCounts(quality);
  const rng = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const inner = SCALE.kuiperInner;
  const outer = SCALE.kuiperOuter;

  for (let i = 0; i < count; i += 1) {
    const r = inner + rng() * (outer - inner);
    const theta = rng() * TWO_PI;
    const tilt = (rng() * 2 - 1) * KUIPER_SCATTER_DEG * DEG2RAD;

    // Spherical placement: a radius on the tilted cone plus a rotation about Y.
    positions[i * 3] = r * Math.cos(tilt) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(tilt);
    positions[i * 3 + 2] = -r * Math.cos(tilt) * Math.sin(theta);

    // Per-point brightness jitter keeps the shell from reading as a flat ring.
    const brightness = 0.35 + rng() * 0.4;
    colors[i * 3] = 0.72 * brightness;
    colors[i * 3 + 1] = 0.8 * brightness;
    colors[i * 3 + 2] = 0.95 * brightness;
  }

  return { count, positions, colors };
}

export type KuiperBelt = {
  points: THREE.Points;
  /** Swaps the visible point count for a new tier. */
  setQuality: (quality: Quality) => void;
};

// A single Points cloud over the Kuiper band. A shader material applies a
// distance fade so far points sink toward the background instead of forming a
// hard outer edge.
export function createKuiperBelt(quality: Quality): KuiperBelt {
  const data = sampleKuiper("high");
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(data.colors, 3));

  const inner = SCALE.kuiperInner;
  const outer = SCALE.kuiperOuter;
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uInner: { value: inner },
      uOuter: { value: outer },
    },
    vertexShader: [
      "attribute vec3 color;",
      "uniform float uInner;",
      "uniform float uOuter;",
      "varying vec3 vColor;",
      "varying float vFade;",
      "void main() {",
      "  vColor = color;",
      "  float r = length(position);",
      "  vFade = 1.0 - smoothstep(uInner, uOuter, r);",
      "  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
      "  gl_Position = projectionMatrix * mvPosition;",
      "  gl_PointSize = 1.6;",
      "}",
    ].join("\n"),
    fragmentShader: [
      "varying vec3 vColor;",
      "varying float vFade;",
      "void main() {",
      "  float a = 0.5 * vFade;",
      "  if (a < 0.02) discard;",
      "  gl_FragColor = vec4(vColor, a);",
      "}",
    ].join("\n"),
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.name = "kuiper-belt";
  points.count = kuiperCounts(quality);

  const setQuality = (q: Quality): void => {
    points.count = kuiperCounts(q);
  };

  return { points, setQuality };
}
