import * as THREE from "three";
import { SCALE } from "./solar-system.data";

// A deterministic pseudo-random generator (mulberry32). Keeping the starfield
// seeded means the layout is identical every load, which helps visual reviews
// and screenshots diff cleanly.
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A soft radial glow drawn to a 2D canvas; returns a CanvasTexture, or null
// when no 2D context is available (node tests), so createSun stays testable.
function glowTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,247,224,0.95)");
  gradient.addColorStop(0.25, "rgba(255,214,150,0.55)");
  gradient.addColorStop(0.55, "rgba(255,166,90,0.16)");
  gradient.addColorStop(1, "rgba(255,140,60,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSun(): {
  group: THREE.Group;
  light: THREE.PointLight;
  mesh: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.name = "sun";

  const geometry = new THREE.SphereGeometry(SCALE.sunRadius, 64, 64);
  const material = new THREE.MeshBasicMaterial({ color: "#fff6e0" });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "sun-sphere";
  group.add(mesh);

  // The glow is a camera-facing sprite, additive so it reads as light rather
  // than a solid disc. Skipped without a 2D context.
  const texture = glowTexture();
  if (texture) {
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      color: "#ffca7a",
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const glow = new THREE.Sprite(spriteMaterial);
    glow.scale.setScalar(SCALE.sunRadius * 7);
    group.add(glow);
  }

  // Zero decay keeps the light physical across the whole scene instead of
  // falling off like a point source; intensity is picked for the standard
  // material response of the planets.
  const light = new THREE.PointLight("#fff1d6", 2.4, 0, 0);
  light.position.set(0, 0, 0);
  group.add(light);

  return { group, light, mesh };
}
