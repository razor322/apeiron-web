import * as THREE from "three";
import gsap from "gsap";
import type { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { createComposer, TIER_TABLE } from "./post";
import {
  attachPicking,
  focusDistance,
  proxyRadius,
  type PickProxy,
  type PickingHandles,
} from "./picking";
import { createLabels, SUN_LABEL_SIN, type LabelHandles } from "./labels";
import { stepTier, LOW_FPS, HIGH_FPS } from "./adaptive";
import { createSun } from "./sun";
import { createStarfield } from "./starfield";
import { BODIES, bodyById, SCALE, type BodyDef } from "./solar-system.data";
import { applyBodyStep, createBody, type BodyView } from "./bodies/planet";
import { createEarth } from "./bodies/earth";
import { createRings, type RingView } from "./rings";
import { createAsteroidBelt, type AsteroidBelt } from "./asteroid-belt";
import { createKuiperBelt, type KuiperBelt } from "./kuiper-belt";
import { applyMoonStep, createMoons, MOONS } from "./moons";
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

const OUTERMOST_ORBIT = 71;
const CAMERA_DISTANCE = 190;

export class SolarSystem {
  readonly info: SolarSystemInfo;

  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private composer: EffectComposer | null = null;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly scene = new THREE.Scene();
  private readonly listeners = new Map<SolarSystemEvent, Set<(payload: unknown) => void>>();

  private readonly starfield: THREE.Points;
  private readonly sunLight: THREE.PointLight;
  private readonly bodyViews: BodyView[] = [];
  private readonly ringViews: { view: RingView; tilt: THREE.Group }[] = [];
  private readonly moonGroups: THREE.Group[] = [];
  private readonly moonViews: { def: (typeof MOONS)[number]; pivot: THREE.Group }[] = [];
  private readonly asteroidBelt: AsteroidBelt;
  private readonly kuiperBelt: KuiperBelt;
  private readonly scratch = new THREE.Vector3();
  private earth: ReturnType<typeof createEarth> | null = null;
  private earthPivot: THREE.Group | null = null;
  private readonly earthSunDir = new THREE.Vector3();

  // Picking and labels. The proxy meshes are invisible hit targets (one per
  // body) that carry the body's world position; the labels are the CSS2D
  // overlay. Both are optional: they need a DOM, so a node build skips them.
  private picking: PickingHandles | null = null;
  private labels: LabelHandles | null = null;
  private readonly pickProxies: PickProxy[] = [];
  private readonly labelBodies: { id: string; object: THREE.Object3D }[] = [];
  private labelsEnabled = false;
  private orbitsEnabled = true;
  private readonly sunGroup: THREE.Group;
  private hoveredId: string | null = null;
  private hoveredLine: THREE.LineLoop | null = null;

  // Active focus: the body the camera is following, the tween driving the
  // initial move, and the world offset the camera keeps once the tween ends.
  private focusId: string | null = null;
  private readonly focusDelta = new THREE.Vector3();
  private focusTween: gsap.core.Tween | null = null;

  private rafId: number | null = null;
  private running = false;
  private disposed = false;

  private lastFrameMs = 0;
  private simTime = 0;
  private timeScale = 1;
  private fpsAccumulator = 0;
  private fpsFrames = 0;

  // Adaptive quality: the probe timers the step function reads, plus the two
  // visibility gates (canvas on screen, tab foregrounded).
  private lowForSec = 0;
  private highForSec = 0;
  private sinceStepSec = 0;
  private onScreen = true;
  private tabVisible = true;
  private intersectionObserver: IntersectionObserver | null = null;

  private readonly onResize = () => this.resize();

  private readonly labelFor: (id: BodyId) => string;

  constructor(
    canvas: HTMLCanvasElement,
    opts?: { quality?: Quality; labelFor?: (id: BodyId) => string },
  ) {
    this.canvas = canvas;
    this.labelFor = opts?.labelFor ?? ((id) => id);

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
    // enough that the outermost planet orbit (71 units) still fits with margin.
    this.camera.position.set(0, CAMERA_DISTANCE * 0.55, CAMERA_DISTANCE * 0.83);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    // Closer than the Sun surface (radius 3.5) plus margin.
    this.controls.minDistance = 5;
    this.controls.maxDistance = 260;
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
    this.sunGroup = sun.group;
    this.scene.add(sun.group);

    // The Sun is a pick and label target too, so it gets the same proxy and
    // label treatment as the planets.
    this.makeProxy("sun", SCALE.sunRadius, sun.group);

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
        this.registerInteractive(def, view);
        this.attachRings(def, view);
        this.attachMoons(def, view);
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
      this.registerInteractive(def, view);
      this.attachRings(def, view);
      this.attachMoons(def, view);
    }
    // The belts share the scene's sim time; the asteroid belt moves on the GPU,
    // the Kuiper hint only fades with distance and never needs a per-frame write.
    this.asteroidBelt = createAsteroidBelt(tier);
    this.scene.add(this.asteroidBelt.group);
    this.kuiperBelt = createKuiperBelt(tier);
    this.scene.add(this.kuiperBelt.points);

    this.setupInteractivity();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.onResize);
    }
  }

  // Picking needs a DOM element and labels need a positioned parent; a node
  // build (tests) has neither, so both are set up only when the canvas is
  // connected. The label overlay lives inside the canvas's parent, sized to the
  // canvas box, so it tracks the same layout.
  private setupInteractivity(): void {
    const canvas = this.canvas;
    const parent = canvas.parentElement;
    if (typeof window === "undefined" || !parent) return;

    this.picking = attachPicking(this.camera, canvas, this.pickProxies, {
      onHover: (id) => this.setHover(id),
      onSelect: (id) => this.emit("select", id),
    });
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("click", this.onClick);

    this.labels = createLabels(parent);
    for (const { id, object } of this.labelBodies) {
      const element = document.createElement("div");
      const def = bodyById(id as BodyId);
      element.textContent = def ? this.labelFor(def.id) : id;
      element.style.color = "#e6e8ef";
      element.style.fontSize = "11px";
      element.style.letterSpacing = "0.08em";
      element.style.textTransform = "uppercase";
      element.style.textShadow = "0 0 6px #04050a";
      const object3d = new CSS2DObject(element);
      object3d.name = `label-${id}`;
      object.add(object3d);
      this.labels.objects.set(id, object3d);
    }
    this.labels.setSize(canvas.clientWidth || 1, canvas.clientHeight || 1);

    // Render only while the canvas is on screen and the tab is foregrounded.
    // IntersectionObserver needs a real observer, so guard for it.
    if (typeof IntersectionObserver !== "undefined") {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        this.onScreen = entry ? entry.isIntersecting : true;
      });
      this.intersectionObserver.observe(canvas);
    }
    this.tabVisible = !document.hidden;
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  private readonly onVisibilityChange = (): void => {
    this.tabVisible = !document.hidden;
  };

  private get renderEnabled(): boolean {
    return this.onScreen && this.tabVisible;
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.picking?.update(event.clientX, event.clientY);
  };

  private readonly onClick = (): void => {
    this.picking?.click();
  };

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
    this.kuiperBelt.setQuality(q);
    this.resize();
    this.emit("tier", q);
  }

  toggleOrbits(on: boolean): void {
    this.orbitsEnabled = on;
    for (const view of this.bodyViews) view.orbitLine.visible = on;
  }

  toggleMoons(on: boolean): void {
    for (const group of this.moonGroups) group.visible = on;
  }

  toggleLabels(on: boolean): void {
    this.labelsEnabled = on;
  }

  // Flies the camera to a body and keeps following it. `bodyById` gives the
  // extent; `focusDistance` sizes the framing; GSAP drives the move; once it
  // lands, `focusId` keeps the camera locked to the body each frame.
  focus(id: string): void {
    if (this.disposed) return;
    const target = this.focusTargetFor(id);
    if (!target) return;

    const def = bodyById(id as BodyId);
    const ringExtent = def?.ringOuter !== undefined ? def.ringOuter : 0;
    const radialExtent = (def?.displayRadius ?? 1) + ringExtent;
    const distance = focusDistance(
      radialExtent,
      this.controls.minDistance,
      this.controls.maxDistance,
    );

    this.focusId = id;
    this.focusTween?.kill();

    const worldPos = target.getWorldPosition(this.scratch).clone();
    // Keep the camera's current viewing direction; only its distance changes,
    // so the move reads as a push-in rather than a cut to a new angle.
    const dir = this.camera.position.clone().sub(this.controls.target);
    if (dir.lengthSq() < 1e-6) dir.set(0, 0.55, 1);
    dir.normalize();

    const endPos = worldPos.clone().addScaledVector(dir, distance);

    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const state = { t: 0 };
    this.focusTween = gsap.to(state, {
      t: 1,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => {
        this.camera.position.lerpVectors(startPos, endPos, state.t);
        this.controls.target.lerpVectors(startTarget, worldPos, state.t);
        this.controls.update();
      },
      onComplete: () => {
        this.focusTween = null;
      },
    });
  }

  resetView(): void {
    this.focusTween?.kill();
    this.focusTween = null;
    this.focusId = null;
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
    this.focusTween?.kill();
    this.picking?.dispose();
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("click", this.onClick);
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }
    this.labels?.dispose();
    this.controls.dispose();
    this.composer?.dispose();
    this.composer = null;
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

    applyMoonStep(this.moonViews, this.simTime, this.scratch);

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

    this.followFocus();
    this.controls.update();
    if (this.renderEnabled) {
      if (this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }

      this.labels?.update({
        scene: this.scene,
        camera: this.camera,
        bodies: this.labelBodies,
        sunSinTolerance: SUN_LABEL_SIN,
        enabled: this.labelsEnabled,
      });
    }

    this.fpsAccumulator += delta;
    this.fpsFrames += 1;
    if (this.fpsAccumulator >= 0.5) {
      this.info.fps = Math.round(this.fpsFrames / this.fpsAccumulator);
      this.fpsAccumulator = 0;
      this.fpsFrames = 0;
      this.probeQuality(delta);
    }
    this.info.drawCalls = this.renderer.info.render.calls;
    this.info.triangles = this.renderer.info.render.triangles;

    this.rafId = requestAnimationFrame(this.tick);
  };

  // The adaptive probe: accumulate how long the rolling average has held under
  // or over the thresholds, hand the timers to the pure step function, and swap
  // the tier when it says so. It runs once per half-second fps sample.
  private probeQuality(sampleSec: number): void {
    this.sinceStepSec += sampleSec;
    if (this.info.fps < LOW_FPS) {
      this.lowForSec += sampleSec;
      this.highForSec = 0;
    } else if (this.info.fps > HIGH_FPS) {
      this.highForSec += sampleSec;
      this.lowForSec = 0;
    } else {
      this.lowForSec = 0;
      this.highForSec = 0;
    }

    const { tier, changed } = stepTier({
      tier: this.info.tier,
      avgFps: this.info.fps,
      lowForSec: this.lowForSec,
      highForSec: this.highForSec,
      sinceStepSec: this.sinceStepSec,
    });
    if (!changed) return;

    this.lowForSec = 0;
    this.highForSec = 0;
    this.sinceStepSec = 0;
    this.setQuality(tier);
  }

  // Rings attach to the tilt group, not the spin mesh, so the ring plane stays
  // fixed while the planet rotates inside it. The Sun sits at the origin, so
  // its world position is the constant the shader reads.
  private attachRings(def: BodyDef, view: BodyView): void {
    const rings = createRings(def, def.displayRadius);
    if (!rings) return;
    view.tilt.add(rings.mesh);
    this.ringViews.push({ view: rings, tilt: view.tilt });
  }

  // Moons live inside the planet's tilt group, so each orbits in the tilted
  // equatorial plane. The group carries every satellite for that planet and
  // starts hidden; toggleMoons flips the whole set at once.
  private attachMoons(def: BodyDef, view: BodyView): void {
    const defs = MOONS.filter((m) => m.parentId === def.id);
    if (defs.length === 0) return;
    const group = createMoons(defs, def.displayRadius);
    view.tilt.add(group);
    this.moonGroups.push(group);
    for (const pivot of group.children) {
      const moonDef = defs.find((m) => m.id === pivot.name);
      if (moonDef) this.moonViews.push({ def: moonDef, pivot: pivot as THREE.Group });
    }
  }

  // One invisible hit proxy: a sphere parented to `parent` (the body's tilt
  // group, or the Sun group) so it follows the body for free. It is larger than
  // the real body when the body is tiny, so small worlds stay clickable.
  private makeProxy(id: string, displayRadius: number, parent: THREE.Object3D): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(proxyRadius(displayRadius), 12, 12);
    const material = new THREE.MeshBasicMaterial({ visible: false });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `pick-${id}`;
    parent.add(mesh);
    this.pickProxies.push({ id, mesh });
    return mesh;
  }

  // Registers a body for picking and labelling. The proxy and the label both
  // hang off the tilt group, which sits at the body's world centre.
  private registerInteractive(def: BodyDef, view: BodyView): void {
    this.makeProxy(def.id, def.displayRadius, view.tilt);
    this.labelBodies.push({ id: def.id, object: view.tilt });
  }

  // The Object3D the camera should chase for an id: a body's tilt group, or the
  // Sun. Returns null for an unknown id.
  private focusTargetFor(id: string): THREE.Object3D | null {
    if (id === "sun") return this.sunGroup;
    const view = this.bodyViews.find((v) => v.def.id === id);
    return view ? view.tilt : null;
  }

  // Hover: highlight the hovered body's orbit line and emit the event. Only one
  // line is lit at a time; the previous one drops back to the base opacity.
  private setHover(id: string | null): void {
    if (id === this.hoveredId) return;
    if (this.hoveredLine) {
      (this.hoveredLine.material as THREE.LineBasicMaterial).opacity = 0.1;
      this.hoveredLine = null;
    }
    this.hoveredId = id;
    if (id) {
      const view = this.bodyViews.find((v) => v.def.id === id);
      if (view) {
        (view.orbitLine.material as THREE.LineBasicMaterial).opacity = 0.6;
        this.hoveredLine = view.orbitLine;
      }
    }
    this.emit("hover", id);
  }

  // Keeps the camera locked to the focused body once the tween has landed: the
  // body keeps orbiting, so the target and the camera both shift by the body's
  // frame-to-frame delta. The framing distance set at focus time is preserved.
  private followFocus(): void {
    if (!this.focusId || this.focusTween) return;
    const target = this.focusTargetFor(this.focusId);
    if (!target) return;
    const worldPos = target.getWorldPosition(this.scratch);
    const delta = this.focusDelta.copy(worldPos).sub(this.controls.target);
    this.controls.target.add(delta);
    this.camera.position.add(delta);
  }

  private applyQuality(q: Quality): void {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, TIER_TABLE[q].pixelRatioCap));
    this.rebuildComposer();
  }

  // Swaps the live composer for the current tier: dispose the old one and, on
  // the tiers that bloom, build a fresh pass chain sized to the canvas. The low
  // tier leaves composer null so the loop renders straight to the canvas.
  private rebuildComposer(): void {
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }
    const width = this.canvas.clientWidth || 1;
    const height = this.canvas.clientHeight || 1;
    this.composer = createComposer(this.renderer, this.scene, this.camera, this.info.tier, {
      width,
      height,
    });
  }

  private resize(): void {
    const width = this.canvas.clientWidth || 1;
    const height = this.canvas.clientHeight || 1;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.composer?.setSize(width, height);
    this.labels?.setSize(width, height);
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
