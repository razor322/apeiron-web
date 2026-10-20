import * as THREE from "three";
import { seededRandom } from "./sun";
import { SCALE } from "./solar-system.data";

// The asteroid belt: three rock variants, each one InstancedMesh, all moved by
// the GPU. The vertex shader reads a uTime uniform plus the per-instance data
// and computes each rock's place on its own Keplerian orbit, so the CPU never
// touches the thousands of matrices per frame. The pure samplers below hold the
// distribution maths and are unit tested; createAsteroidBelt turns them into
// the live scene objects.

export type Quality = "low" | "medium" | "high";

const TWO_PI = Math.PI * 2;
const DEG2RAD = Math.PI / 180;

export const ROCK_VARIANTS = 3;

// Belt half height: the vertical scatter stays within +/-6 degrees of the
// ecliptic, so the band reads as a thin disc rather than a cloud.
export const BELT_SCATTER_DEG = 6;

// Rock sizes in scene units. The generator draws from a power law so small
// rocks vastly outnumber the large ones, which is what a real belt looks like.
export const SIZE_MIN = 0.01;
export const SIZE_MAX = 0.06;

// Fraction of rocks that take one of the pale / dark colors rather than the
// base brown family, so the occasional bright speck stands out.
const LIGHT_FRACTION = 0.12;

const COLORS = ["#6b625a", "#8a7f73", "#5a524b"] as const;
const LIGHT_COLORS = ["#b0a392", "#3d3834"] as const;

export function asteroidCounts(quality: Quality): number {
  if (quality === "high") return 6000;
  if (quality === "medium") return 3000;
  return 1500;
}

// Maps a uniform sample t in [0, 1) to an orbit radius across the belt. The
// shape folds the sample toward the belt centre, so more rocks sit near
// the middle of the band than at its edges.
export function beltRadius(t: number): number {
  const centre = (SCALE.beltInner + SCALE.beltOuter) / 2;
  const half = (SCALE.beltOuter - SCALE.beltInner) / 2;
  const signed = 2 * t - 1;
  return centre + Math.sign(signed) * Math.abs(signed) ** 2 * half;
}

// Power law size draw: t ** 2.2 skews the result hard toward SIZE_MIN while a
// few samples still reach SIZE_MAX.
export function beltSize(t: number): number {
  return SIZE_MIN + (SIZE_MAX - SIZE_MIN) * t ** 2.2;
}

// Circular orbital speed about the Sun, falling off as r ^ -1.5 (Kepler). The
// constant only sets the scene pacing; the shape is the physical part.
export function keplerianSpeed(radius: number): number {
  return 0.6 / radius ** 1.5;
}

// One variant's rocks, in draw order. Every array has length `capacity` (the
// high tier count for that variant); a lower tier simply draws fewer of them.
export type BeltData = {
  count: number;
  radius: Float32Array;
  angle: Float32Array;
  y: Float32Array;
  size: Float32Array;
  tumbleAxis: Float32Array;
  tumbleSpeed: Float32Array;
  colorIndex: Float32Array;
};

// Per variant rock budget at the high tier; the three counts sum to 6000.
export function variantCounts(total: number): number[] {
  const base = Math.floor(total / ROCK_VARIANTS);
  return Array.from({ length: ROCK_VARIANTS }, (_, v) =>
    v === ROCK_VARIANTS - 1 ? total - base * (ROCK_VARIANTS - 1) : base,
  );
}

// Draws one variant's per-instance attributes. Pure given the seed, so the
// layout is identical each load and testable without a WebGL context.
export function sampleBelt(quality: Quality, seed = 20261019): BeltData {
  const capacity = variantCounts(asteroidCounts("high"))[0]!;
  const rng = seededRandom(seed);
  const data: BeltData = {
    count: capacity,
    radius: new Float32Array(capacity),
    angle: new Float32Array(capacity),
    y: new Float32Array(capacity),
    size: new Float32Array(capacity),
    tumbleAxis: new Float32Array(capacity * 3),
    tumbleSpeed: new Float32Array(capacity),
    colorIndex: new Float32Array(capacity),
  };

  for (let i = 0; i < capacity; i += 1) {
    const r = beltRadius(rng());
    data.radius[i] = r;
    data.angle[i] = rng() * TWO_PI;

    const scatter = rng() * 2 - 1;
    data.y[i] = Math.tan(scatter * BELT_SCATTER_DEG * DEG2RAD) * r;
    data.size[i] = beltSize(rng());

    // Uniform direction for the tumble axis, then a random spin rate.
    const z = rng() * 2 - 1;
    const theta = rng() * TWO_PI;
    const ring = Math.sqrt(1 - z * z);
    data.tumbleAxis[i * 3] = Math.cos(theta) * ring;
    data.tumbleAxis[i * 3 + 1] = z;
    data.tumbleAxis[i * 3 + 2] = Math.sin(theta) * ring;
    data.tumbleSpeed[i] = (rng() * 2 - 1) * 2;

    data.colorIndex[i] =
      rng() < LIGHT_FRACTION
        ? 1 + Math.floor(rng() * LIGHT_COLORS.length)
        : Math.floor(rng() * COLORS.length);
  }

  return data;
}

// Base color plus the two accent colors, one per instance, as vertex colors.
function fillVariantColors(mesh: THREE.InstancedMesh, data: BeltData, variant: number): void {
  const base = new THREE.Color(COLORS[variant % COLORS.length] ?? COLORS[0]);
  const palette = [base, new THREE.Color(LIGHT_COLORS[0]), new THREE.Color(LIGHT_COLORS[1])];
  for (let i = 0; i < data.count; i += 1) {
    mesh.setColorAt(i, palette[Math.floor(data.colorIndex[i]!) % palette.length]!);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

// One irregular rock: an icosahedron whose vertices are pushed in and out by a
// seeded hash, so no two rocks of a variant share a silhouette.
function rockGeometry(seed: number): THREE.IcosahedronGeometry {
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const rng = seededRandom(seed);
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i += 1) {
    const scale = 0.72 + rng() * 0.5;
    position.setXYZ(i, position.getX(i) * scale, position.getY(i) * scale, position.getZ(i) * scale);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

// GLSL injected into <common>: shared maths used by both the position and the
// normal so lighting tracks the tumble. The orbit advance is Keplerian (r^-1.5),
// so inner rocks lap the outer ones and the belt shears over time.
const BELT_GLSL = /* glsl */ `
  attribute float aRadius;
  attribute float aAngle;
  attribute float aY;
  attribute float aSize;
  attribute vec3 aTumbleAxis;
  attribute float aTumbleSpeed;
  uniform float uTime;
  uniform float uSizeScale;

  mat3 beltAxisRotation(vec3 axis, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    float t = 1.0 - c;
    vec3 a = normalize(axis);
    return mat3(
      t * a.x * a.x + c,       t * a.x * a.y - s * a.z, t * a.x * a.z + s * a.y,
      t * a.x * a.y + s * a.z, t * a.y * a.y + c,       t * a.y * a.z - s * a.x,
      t * a.x * a.z - s * a.y, t * a.y * a.z + s * a.x, t * a.z * a.z + c
    );
  }
  vec3 beltOrbit(float radius, float angle, float yOffset, float time) {
    float theta = angle + time * pow(radius, -1.5) * 0.6;
    return vec3(radius * cos(theta), yOffset, -radius * sin(theta));
  }
  vec3 beltPosition(vec3 position, float radius, float angle, float yOffset, float size, vec3 axis, float spin, float time, float sizeScale) {
    mat3 tumble = beltAxisRotation(axis, time * spin);
    return beltOrbit(radius, angle, yOffset, time) + tumble * (position * size * sizeScale);
  }
`;

const BELT_NORMAL_GLSL = /* glsl */ `
  mat3 beltTumble = beltAxisRotation(aTumbleAxis, uTime * aTumbleSpeed);
  vec3 objectNormal = beltTumble * normal;
`;

const BELT_POSITION_GLSL = /* glsl */ `
  vec3 transformed = beltPosition(position, aRadius, aAngle, aY, aSize, aTumbleAxis, aTumbleSpeed, uTime, uSizeScale);
`;

// The vertex shader already produced a world-space position; apply the model
// and view matrices once, skipping the default instancing matrix (identity).
const BELT_PROJECT_GLSL = /* glsl */ `
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;
`;

export type AsteroidBelt = {
  group: THREE.Group;
  /** Writes the shared sim time into every shader; call once per frame. */
  update: (simTime: number) => void;
  /** Swaps the visible rock count for a new tier without a scene rebuild. */
  setQuality: (quality: Quality) => void;
  /** Live instance counts per variant, for the draw-call budget readout. */
  counts: number[];
};

// Builds the belt as one group holding ROCK_VARIANTS instanced meshes, one per
// rock variant. Each mesh owns its own per-instance buffer sampled at the high
// tier; a lower tier only reduces mesh.count, so raising it back never reshuffles
// the rocks.
export function createAsteroidBelt(quality: Quality): AsteroidBelt {
  const group = new THREE.Group();
  group.name = "asteroid-belt";
  // A slight incline so the belt does not read as a razor flat disc from above.
  group.rotation.x = 1.5 * DEG2RAD;

  const counts = variantCounts(asteroidCounts(quality));
  const uniforms = { uTime: { value: 0 }, uSizeScale: { value: 1 } };
  const meshes: THREE.InstancedMesh[] = [];

  for (let variant = 0; variant < ROCK_VARIANTS; variant += 1) {
    const data = sampleBelt("high", 20261019 + variant * 7);
    const geometry = rockGeometry(1000 + variant);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.95,
      metalness: 0,
      vertexColors: true,
    });

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uSizeScale = uniforms.uSizeScale;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${BELT_GLSL}`)
        .replace("#include <beginnormal_vertex>", BELT_NORMAL_GLSL)
        .replace("#include <begin_vertex>", BELT_POSITION_GLSL)
        .replace("#include <project_vertex>", BELT_PROJECT_GLSL);
    };
    material.customProgramCacheKey = () => `asteroid-belt-${variant}`;

    const mesh = new THREE.InstancedMesh(geometry, material, data.count);
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    mesh.name = `asteroid-belt-${variant}`;

    // Identity matrices: the shader places every rock, the instancing matrix is
    // only present because InstancedMesh requires it.
    const identity = new THREE.Matrix4();
    for (let i = 0; i < data.count; i += 1) mesh.setMatrixAt(i, identity);
    mesh.instanceMatrix.needsUpdate = true;

    const attr = (arr: Float32Array, itemSize: number): THREE.InstancedBufferAttribute =>
      new THREE.InstancedBufferAttribute(arr, itemSize);
    geometry.setAttribute("aRadius", attr(data.radius, 1));
    geometry.setAttribute("aAngle", attr(data.angle, 1));
    geometry.setAttribute("aY", attr(data.y, 1));
    geometry.setAttribute("aSize", attr(data.size, 1));
    geometry.setAttribute("aTumbleAxis", attr(data.tumbleAxis, 3));
    geometry.setAttribute("aTumbleSpeed", attr(data.tumbleSpeed, 1));

    fillVariantColors(mesh, data, variant);
    mesh.count = Math.min(counts[variant]!, data.count);
    meshes.push(mesh);
    group.add(mesh);
  }

  const update = (simTime: number): void => {
    uniforms.uTime.value = simTime;
  };

  const setQuality = (q: Quality): void => {
    const next = variantCounts(asteroidCounts(q));
    for (let variant = 0; variant < meshes.length; variant += 1) {
      meshes[variant]!.count = Math.min(next[variant]!, meshes[variant]!.instanceMatrix.count);
    }
  };

  return { group, update, setQuality, counts: meshes.map((m) => m.count) };
}
