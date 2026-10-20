import * as THREE from "three";
import { type BodyDef } from "./solar-system.data";
import { sampleRingStrip, type RingKind } from "./shaderstrips";

// Ring meshes for the ringed planets, built on the brief's spec: one
// RingGeometry per planet with UVs remapped so u is the normalized radial
// position, a ShaderMaterial that lights the ring from the Sun side (forward
// scattering) and darkens the planet's shadow on the rings with an analytic
// ray-sphere test. The mesh is added to the body's tilt group, never the spin
// mesh, so the planet rotates inside a stationary ring plane.

// Normalized radial position of a vertex: 0 at the inner edge, 1 at the outer.
// The default RingGeometry UVs are planar, so the mesh rebuilds them from each
// vertex's distance from the ring centre.
export function ringRadialU(distance: number, inner: number, outer: number): number {
  const span = outer - inner;
  if (span <= 0) return 0;
  const u = (distance - inner) / span;
  return u < 0 ? 0 : u > 1 ? 1 : u;
}

// Rewrites a ring geometry's `uv` attribute so u is the radial position, using
// the XZ plane distance of each vertex from the ring centre. v is left at 0.5
// (the strip is one row tall, so v is unused). Returns the same geometry.
export function remapRingUVs(geometry: THREE.BufferGeometry, inner: number, outer: number): THREE.BufferGeometry {
  const position = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i);
    uv.setXY(i, ringRadialU(Math.hypot(x, z), inner, outer), 0.5);
  }
  uv.needsUpdate = true;
  return geometry;
}

const RING_TMP_CLOSEST = new THREE.Vector3();
const RING_TMP_D = new THREE.Vector3();
const RING_TMP_SUN = new THREE.Vector3();

// Analytic planet shadow: 1 when the fragment sees the Sun, 0 when the planet
// blocks it. A ray is cast from the fragment toward the Sun; if its closest
// approach to the planet centre is inside the planet radius and the planet is
// in front of the fragment along that ray, the fragment is in shadow. The Sun
// is a point (the scene puts it at the origin), so `sun` is its world position.
export function ringShadowFactor(
  point: THREE.Vector3,
  planetCenter: THREE.Vector3,
  planetRadius: number,
  sun: THREE.Vector3,
): number {
  RING_TMP_SUN.subVectors(sun, point);
  const sunDist = RING_TMP_SUN.length();
  if (sunDist === 0) return 1;
  RING_TMP_SUN.multiplyScalar(1 / sunDist);

  RING_TMP_D.subVectors(planetCenter, point);
  const t = RING_TMP_D.dot(RING_TMP_SUN);
  if (t <= 0) return 1; // planet is behind the fragment, cannot shadow it
  if (t >= sunDist) return 1; // planet is beyond the Sun, out of the way

  RING_TMP_CLOSEST.copy(RING_TMP_SUN).multiplyScalar(t).add(point);
  const away = RING_TMP_CLOSEST.distanceTo(planetCenter);
  return away < planetRadius ? 0 : 1;
}

const RING_KIND: Partial<Record<BodyDef["id"], RingKind>> = {
  saturn: "saturn",
  uranus: "uranus",
  neptune: "neptune",
};

const RING_SEGMENTS = 256;
const STRIP_WIDTH = 2048;

// One row RGBA strip built from the shared sampleRingStrip table. Using a
// DataTexture keeps rings.ts free of the DOM, so it builds and tests in the
// node environment; the browser never has to fetch the PNG.
function ringStripTexture(kind: RingKind): THREE.DataTexture {
  const data = new Uint8Array(STRIP_WIDTH * 4);
  for (let x = 0; x < STRIP_WIDTH; x += 1) {
    const { rgb, alpha } = sampleRingStrip(kind, x / (STRIP_WIDTH - 1));
    const i = x * 4;
    data[i] = Math.round(rgb[0] * 255);
    data[i + 1] = Math.round(rgb[1] * 255);
    data[i + 2] = Math.round(rgb[2] * 255);
    data[i + 3] = Math.round(alpha * 255);
  }
  const texture = new THREE.DataTexture(data, STRIP_WIDTH, 1, THREE.RGBAFormat);
  // No mipmaps on a 2048x1 row; clamp so radial sampling never wraps.
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

const RING_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Samples the strip by radial u, lights from the Sun side, then applies the
// analytic shadow. Sun direction and the planet's world position/radius arrive
// as uniforms, refreshed each frame from the live scene graph.
const RING_FRAGMENT = /* glsl */ `
  uniform sampler2D uStrip;
  uniform vec3 uSunWorld;
  uniform vec3 uPlanetCenter;
  uniform float uPlanetRadius;
  uniform vec3 uSunColor;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  float shadowFactor(vec3 point) {
    vec3 toSun = uSunWorld - point;
    float sunDist = length(toSun);
    if (sunDist == 0.0) return 1.0;
    toSun /= sunDist;
    vec3 toPlanet = uPlanetCenter - point;
    float t = dot(toPlanet, toSun);
    if (t <= 0.0) return 1.0;
    if (t >= sunDist) return 1.0;
    vec3 closest = point + toSun * t;
    float away = distance(closest, uPlanetCenter);
    return away < uPlanetRadius ? 0.0 : 1.0;
  }

  void main() {
    vec4 strip = texture2D(uStrip, vec2(vUv.x, 0.5));
    // Forward scattering: the lit face brightens toward the Sun, and the far
    // side dims, which reads as the ring catching sunlight at a grazing angle.
    vec3 toSun = normalize(uSunWorld - vWorldPos);
    vec3 normal = vec3(0.0, 1.0, 0.0);
    float facing = abs(dot(normalize(toSun), normal));
    float lit = mix(0.35, 1.0, facing);
    float shadow = shadowFactor(vWorldPos);
    vec3 color = strip.rgb * uSunColor * lit * shadow;
    gl_FragColor = vec4(color, strip.a);
    if (gl_FragColor.a < 0.001) discard;
  }
`;

export type RingView = {
  mesh: THREE.Mesh;
  uniforms: {
    uStrip: { value: THREE.Texture };
    uSunWorld: { value: THREE.Vector3 };
    uPlanetCenter: { value: THREE.Vector3 };
    uPlanetRadius: { value: number };
    uSunColor: { value: THREE.Color };
  };
};

// Builds one ring mesh for a body that has ring values, sized against the
// planet's scene radius. Returns null for bodies with no rings.
export function createRings(def: BodyDef, planetRadius: number): RingView | null {
  const kind = RING_KIND[def.id];
  if (!kind) return null;
  if (def.ringInner === undefined || def.ringOuter === undefined) return null;

  const inner = def.ringInner * planetRadius;
  const outer = def.ringOuter * planetRadius;

  const geometry = new THREE.RingGeometry(inner, outer, RING_SEGMENTS, 1);
  remapRingUVs(geometry, inner, outer);

  const uniforms = {
    uStrip: { value: ringStripTexture(kind) },
    uSunWorld: { value: new THREE.Vector3(0, 0, 0) },
    uPlanetCenter: { value: new THREE.Vector3(0, 0, 0) },
    uPlanetRadius: { value: planetRadius },
    uSunColor: { value: new THREE.Color("#fff1d6") },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: RING_VERTEX,
    fragmentShader: RING_FRAGMENT,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  // After the planet (0) and before the glow sprites, so rings blend over the
  // planet surface without punching through the starfield.
  mesh.renderOrder = 1;
  mesh.name = `${def.id}-rings`;

  // RingGeometry lies in the XY plane; lay it flat on the planet's equator so
  // the tilt group carries it with the planet's axial tilt.
  mesh.rotation.x = -Math.PI / 2;

  return { mesh, uniforms };
}
