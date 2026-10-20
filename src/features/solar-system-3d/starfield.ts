import * as THREE from "three";

import { seededRandom } from "./sun";

// Star shell radii in scene units: far enough that the camera (max distance
// 160) never reaches the shell, close enough to stay inside the far plane.
export const STAR_SHELL_INNER = 600;
export const STAR_SHELL_OUTER = 900;
export const STAR_COUNT = 6000;

// A white-hot core fading to the cool blue-white of a distant star; the two
// tints are mixed per star for a cheap color-temperature variation.
const WARM = new THREE.Color("#fff4d6");
const COOL = new THREE.Color("#c8d8ff");

export function createStarfield(seed = 20261018): THREE.Points {
  const rng = seededRandom(seed);
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);

  for (let i = 0; i < STAR_COUNT; i += 1) {
    // Uniform point on a unit sphere (z uniform, theta uniform) so the shell
    // does not clump at the poles.
    const z = rng() * 2 - 1;
    const theta = rng() * Math.PI * 2;
    const ring = Math.sqrt(1 - z * z);
    const radius = STAR_SHELL_INNER + rng() * (STAR_SHELL_OUTER - STAR_SHELL_INNER);

    positions[i * 3] = Math.cos(theta) * ring * radius;
    positions[i * 3 + 1] = z * radius;
    positions[i * 3 + 2] = Math.sin(theta) * ring * radius;

    const mix = rng();
    const r = WARM.r + (COOL.r - WARM.r) * mix;
    const g = WARM.g + (COOL.g - WARM.g) * mix;
    const b = WARM.b + (COOL.b - WARM.b) * mix;
    const brightness = 0.6 + rng() * 0.4;
    colors[i * 3] = r * brightness;
    colors[i * 3 + 1] = g * brightness;
    colors[i * 3 + 2] = b * brightness;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.6,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = -1;
  return points;
}
