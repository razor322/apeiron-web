import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createSun } from "./sun";
import { createStarfield } from "./starfield";
import { BODIES, type BodyDef } from "./solar-system.data";
import { applyBodyStep, createBody, type BodyView } from "./bodies/planet";
import { createEarth } from "./bodies/earth";
import { createRings, type RingView } from "./rings";
import { createAsteroidBelt, type AsteroidBelt } from "./asteroid-belt";
import {
  proceduralTexture,
  type ProceduralKind,
  type ProceduralOpts,
} from "./bodies/procedural";
import type { BodyId } from "./solar-system.data";

// Surface recipe for every body that has no verified photographic texture. The
// colors are the spec values; the spot positions are hand-tuned to sit on the
// visible face rather than the seam.
const PROCEDURAL: Partial<Record<BodyId, { kind: ProceduralKind; colors: string[]; opts?: ProceduralOpts }>> = {
  mercury: { kind: "rocky", colors: ["#8c8680"], opts: { seed: 2 } },
  venus: { kind: "rocky", colors: ["#e8cda0", "#f0dbb4"], opts: { seed: 5, clouds: true } },
  mars: { kind: "rocky", colors: ["#c1502e"], opts: { seed: 9, polarCaps: true } },
  ceres: {
    kind: "rocky",
    colors: ["#8d8a85"],
    opts: { seed: 13, spot: { color: "#e9e6df", u: 0.6, v: 0.46, radius: 0.05 } },
  },
  jupiter: {
    kind: "gas",
    colors: ["#d8b48a", "#a9825a"],
    opts: { seed: 21, spot: { color: "#b8472f", u: 0.62, v: 0.62, radius: 0.1 } },
  },
  saturn: { kind: "gas", colors: ["#e5d3a1", "#c9b784"], opts: { seed: 27 } },
  uranus: { kind: "icy", colors: ["#a8e3e6"], opts: { seed: 33 } },
  neptune: {
    kind: "gas",
    colors: ["#3b57c9", "#27408f"],
    opts: { seed: 39, spot: { color: "#1a2f6b", u: 0.35, v: 0.55, radius: 0.12 } },
  },
  pluto: { kind: "pluto", colors: ["#c9b49a"], opts: { seed: 45 } },
};

// Core Three.js scene for the solar system page: renderer, camera, loop and
// disposal only. Task 1.1 keeps the scene empty; later tasks add the bodies,
// orbits and labels. Every body, size and orbit radius comes from
// solar-system.data.ts, which the page treats as the single source of truth.

export type Quality = "low" | "medium" | "high";

export type SolarSystemEvent = "hover" | "select" | "tier";

export type SolarSystemInfo = {
  tier: Quality;
  fps: number;
  drawCalls: number;
  triangles: number;
};

export class WebGLUnavailableError extends Error {
  constructor(message = "WebGL is not available in this browser or context") {
    super(message);
    this.name = "WebGLUnavailableError";
  }
}

// Clamped frame delta: a tab that was backgrounded for seconds must not fling
// the simulation forward by that whole gap, so anything past 0.1 s counts as a
// single short frame.
export function frameDelta(prevMs: number, nowMs: number): number {
  const seconds = (nowMs - prevMs) / 1000;
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.min(seconds, 0.1);
}

// Cheap tier pick from signals already on the device; no benchmark runs.
export function deviceTier(
  devicePixelRatio: number,
  cores: number,
  isMobile: boolean,
): Quality {
  if (isMobile || cores <= 4 || devicePixelRatio >= 3) return "low";
  if (cores >= 8 && devicePixelRatio <= 2) return "high";
  return "medium";
}

const TIER_PIXEL_CAP: Record<Quality, number> = {
  low: 1,
  medium: 1.5,
  high: 2,
};

const OUTERMOST_ORBIT = 51;
const CAMERA_DISTANCE = 150;

export class SolarSystem {
  readonly info: SolarSystemInfo;

  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly scene = new THREE.Scene();
  private readonly listeners = new Map<SolarSystemEvent, Set<(payload: unknown) => void>>();

  private readonly starfield: THREE.Points;
  private readonly sunLight: THREE.PointLight;
  private readonly bodyViews: BodyView[] = [];
  private readonly ringViews: { view: RingView; tilt: THREE.Group }[] = [];
  private readonly asteroidBelt: AsteroidBelt;
  private readonly scratch = new THREE.Vector3();
  private earth: ReturnType<typeof createEarth> | null = null;
  private earthPivot: THREE.Group | null = null;
  private readonly earthSunDir = new THREE.Vector3();

  private rafId: number | null = null;
  private running = false;
  private disposed = false;

  private lastFrameMs = 0;
  private simTime = 0;
  private timeScale = 1;
  private fpsAccumulator = 0;
  private fpsFrames = 0;

  private readonly onResize = () => this.resize();

  constructor(canvas: HTMLCanvasElement, opts?: { quality?: Quality }) {
    this.canvas = canvas;

    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!context) {
      throw new WebGLUnavailableError();
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    // High three quarter view: lifted above the ecliptic and pulled back far
    // enough that the outermost orbit (51 units) still fits with margin.
    this.camera.position.set(0, CAMERA_DISTANCE * 0.55, CAMERA_DISTANCE * 0.83);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    // Closer than the Sun surface (radius 3.5) plus margin.
    this.controls.minDistance = 5;
    this.controls.maxDistance = 160;
    this.controls.target.set(0, 0, 0);

    const tier =
      opts?.quality ??
      deviceTier(
        typeof window === "undefined" ? 1 : window.devicePixelRatio,
        typeof navigator === "undefined" ? 4 : navigator.hardwareConcurrency || 4,
        typeof matchMedia === "function" ? !matchMedia("(min-width: 768px)").matches : false,
      );

    this.info = { tier, fps: 0, drawCalls: 0, triangles: 0 };
    this.applyQuality(tier);
    this.resize();

    this.scene.background = new THREE.Color("#04050a");
    this.scene.add(new THREE.AmbientLight("#0a0d18", 0.35));

    const sun = createSun();
    this.sunLight = sun.light;
    this.scene.add(sun.group);

    this.starfield = createStarfield();
    this.scene.add(this.starfield);

    for (const def of BODIES) {
      if (def.orbitRadius === null) continue;
      if (def.id === "earth") {
        this.earth = createEarth(new THREE.TextureLoader());
        const view = createBody(def, { spin: this.earth.group });
        this.earthPivot = view.orbitPivot;
        this.bodyViews.push(view);
        this.scene.add(view.group);
        this.attachRings(def, view);
        continue;
      }
      const recipe = PROCEDURAL[def.id];
      const view = recipe
        ? createBody(def, {
            material: new THREE.MeshStandardMaterial({
              map: proceduralTexture(recipe.kind, recipe.colors, recipe.opts),
              roughness: 0.9,
              metalness: 0,
            }),
          })
        : createBody(def);
      this.bodyViews.push(view);
      this.scene.add(view.group);
      this.attachRings(def, view);
    }
    // The asteroid belt moves on the GPU; it shares the scene's sim time.
    this.asteroidBelt = createAsteroidBelt(tier);
    this.scene.add(this.asteroidBelt.group);

    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.onResize);
    }
  }

  start(): void {
    if (this.disposed || this.running) return;
    this.running = true;
    this.lastFrameMs = typeof performance === "undefined" ? 0 : performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  pause(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setTimeScale(n: number): void {
    if (this.disposed) return;
    this.timeScale = Number.isFinite(n) ? n : 0;
  }

  setQuality(q: Quality): void {
    if (this.disposed) return;
    this.info.tier = q;
    this.applyQuality(q);
    this.asteroidBelt.setQuality(q);
    this.resize();
    this.emit("tier", q);
  }

  toggleOrbits(on: boolean): void {
    void on;
    // Stub: orbit line visibility lands with the bodies in a later task.
  }

  toggleMoons(on: boolean): void {
    void on;
    // Stub: moon visibility lands with the bodies in a later task.
  }

  toggleLabels(on: boolean): void {
    void on;
    // Stub: label visibility lands with the bodies in a later task.
  }

  focus(id: string): void {
    void id;
    // Stub: camera focus onto a body lands with the bodies in a later task.
  }

  resetView(): void {
    this.camera.position.set(0, CAMERA_DISTANCE * 0.55, CAMERA_DISTANCE * 0.83);
    this.controls.target.set(0, 0, 0);
    this.camera.lookAt(0, 0, 0);
    this.controls.update();
  }

  on(event: SolarSystemEvent, cb: (payload: unknown) => void): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    const handler = cb as (payload: unknown) => void;
    set.add(handler);
    return () => {
      set?.delete(handler);
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.pause();

    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.onResize);
    }

    this.listeners.clear();
    this.controls.dispose();
    disposeScene(this.scene);
    this.renderer.dispose();
  }

  private readonly tick = (): void => {
    if (!this.running || this.disposed) return;

    const nowMs = performance.now();
    const delta = frameDelta(this.lastFrameMs, nowMs);
    this.lastFrameMs = nowMs;

    this.simTime += delta * this.timeScale;

    for (const view of this.bodyViews) {
      applyBodyStep(view, this.simTime, this.scratch);
    }

    this.asteroidBelt.update(this.simTime);

    // The ring shader needs the planet's world centre each frame; the tilt
    // group sits at the planet's position, so its world origin is the centre.
    for (const { view, tilt } of this.ringViews) {
      tilt.getWorldPosition(view.uniforms.uPlanetCenter.value);
      view.uniforms.uSunWorld.value.set(0, 0, 0);
    }

    if (this.earth && this.earthPivot) {
      // The Sun sits at the origin, so the light direction at Earth is simply
      // the unit vector from Earth back to the origin.
      this.earthSunDir
        .copy(this.earthPivot.position)
        .multiplyScalar(-1)
        .normalize();
      this.earth.update(this.earthSunDir, this.simTime);
    }

    // The star shell keeps the camera at its centre so stars read as infinitely
    // far and never drift as the user orbits.
    this.starfield.position.copy(this.camera.position);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this.fpsAccumulator += delta;
    this.fpsFrames += 1;
    if (this.fpsAccumulator >= 0.5) {
      this.info.fps = Math.round(this.fpsFrames / this.fpsAccumulator);
      this.fpsAccumulator = 0;
      this.fpsFrames = 0;
    }
    this.info.drawCalls = this.renderer.info.render.calls;
    this.info.triangles = this.renderer.info.render.triangles;

    this.rafId = requestAnimationFrame(this.tick);
  };

  // Rings attach to the tilt group, not the spin mesh, so the ring plane stays
  // fixed while the planet rotates inside it. The Sun sits at the origin, so
  // its world position is the constant the shader reads.
  private attachRings(def: BodyDef, view: BodyView): void {
    const rings = createRings(def, def.displayRadius);
    if (!rings) return;
    view.tilt.add(rings.mesh);
    this.ringViews.push({ view: rings, tilt: view.tilt });
  }

  private applyQuality(q: Quality): void {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, TIER_PIXEL_CAP[q]));
  }

  private resize(): void {
    const width = this.canvas.clientWidth || 1;
    const height = this.canvas.clientHeight || 1;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private emit(event: SolarSystemEvent, payload: unknown): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const cb of set) cb(payload);
  }
}

// Referenced so the outermost orbit constant stays documented next to the
// camera distance it sizes; later tasks place bodies against it.
export const SCENE_OUTERMOST_ORBIT = OUTERMOST_ORBIT;

// One walk over the graph releasing every geometry, material and texture. GPU
// resources are not garbage collected with the JS objects, so a page teardown
// would leak them without this.
function disposeScene(scene: THREE.Scene): void {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
    if (!material) return;
    for (const m of Array.isArray(material) ? material : [material]) {
      for (const value of Object.values(m)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      m.dispose();
    }
  });
}
