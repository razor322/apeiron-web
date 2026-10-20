import * as THREE from "three";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { isBehindSun } from "./picking";

// Labels as a CSS2D overlay: one DOM element per body, positioned by a
// CSS2DRenderer that shares the canvas's box. A label is hidden when its body
// is behind the Sun (occluded by the disc) or when it lost a simple
// screen-space anti-collision pass to a nearer label. The pure helpers
// (labelVisible, resolveCollisions) hold the rules and are unit tested;
// createLabels only builds the DOM and drives the renderer.

export type LabelHandles = {
  renderer: CSS2DRenderer;
  /** One CSS2DObject per body, keyed by body id. */
  objects: Map<string, CSS2DObject>;
  /** Sets the visibility pass, positions the labels, runs anti-collision. */
  update: (opts: {
    scene: THREE.Scene;
    camera: THREE.Camera;
    bodies: { id: string; object: THREE.Object3D }[];
    sunSinTolerance: number;
    enabled: boolean;
  }) => void;
  setSize: (width: number, height: number) => void;
  dispose: () => void;
};

// The Sun's angular radius widened so a label clears the disc with a little
// margin. 0.05 sin is about a 2.9 degree cone, a touch larger than the Sun at
// the default framing.
export const SUN_LABEL_SIN = 0.05;

// A label is visible when labels are on and the body is not occluded by the
// Sun. Pure: takes the body's world position and the camera's.
export function labelVisible(
  enabled: boolean,
  bodyPos: THREE.Vector3,
  cameraPos: THREE.Vector3,
  sunSinTolerance: number,
): boolean {
  if (!enabled) return false;
  return !isBehindSun(bodyPos, cameraPos, sunSinTolerance);
}

// Simple screen-space anti-collision: sort labels by depth (nearest first) and
// keep a label only if its box does not overlap a kept one. Mutates nothing;
// returns the set of ids to keep. Pure so it can be tested with plain rects.
export type LabelRect = {
  id: string;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function resolveCollisions(rects: LabelRect[]): Set<string> {
  const kept = new Set<string>();
  const keptRects: LabelRect[] = [];
  const ordered = [...rects].sort((a, b) => a.depth - b.depth);
  for (const rect of ordered) {
    const overlaps = keptRects.some(
      (k) =>
        Math.abs(k.x - rect.x) < (k.width + rect.width) / 2 &&
        Math.abs(k.y - rect.y) < (k.height + rect.height) / 2,
    );
    if (overlaps) continue;
    kept.add(rect.id);
    keptRects.push(rect);
  }
  return kept;
}

export function createLabels(container: HTMLElement): LabelHandles {
  const renderer = new CSS2DRenderer();
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.pointerEvents = "none";
  container.appendChild(renderer.domElement);

  const objects = new Map<string, CSS2DObject>();
  const worldPos = new THREE.Vector3();
  const cameraPos = new THREE.Vector3();

  const update: LabelHandles["update"] = ({
    scene,
    camera,
    bodies,
    sunSinTolerance,
    enabled,
  }) => {
    camera.getWorldPosition(cameraPos);

    // First pass: cull labels whose body is off or occluded by the Sun.
    const order: { id: string; object: THREE.Object3D }[] = [];
    for (const entry of bodies) {
      const css = objects.get(entry.id);
      if (!css) continue;
      entry.object.getWorldPosition(worldPos);
      const visible = labelVisible(enabled, worldPos, cameraPos, sunSinTolerance);
      css.visible = visible;
      css.element.style.display = visible ? "" : "none";
      if (visible) order.push(entry);
    }

    // CSS2DRenderer positions every visible object's element from the camera.
    renderer.render(scene, camera);

    // Second pass: an anti-collision pass in the container's screen space. A
    // label that overlaps a nearer kept one is dropped for this frame.
    const rect = renderer.domElement.getBoundingClientRect();
    const rects: LabelRect[] = [];
    for (const entry of order) {
      const css = objects.get(entry.id);
      if (!css) continue;
      const box = css.element.getBoundingClientRect();
      const projected = entry.object.getWorldPosition(worldPos).project(camera);
      rects.push({
        id: entry.id,
        depth: projected.z,
        x: box.left + box.width / 2 - rect.left,
        y: box.top + box.height / 2 - rect.top,
        width: box.width,
        height: box.height,
      });
    }
    const kept = resolveCollisions(rects);
    for (const entry of order) {
      if (kept.has(entry.id)) continue;
      const css = objects.get(entry.id);
      if (!css) continue;
      css.element.style.display = "none";
    }
  };

  return {
    renderer,
    objects,
    update,
    setSize: (width, height) => renderer.setSize(width, height),
    dispose: () => renderer.domElement.remove(),
  };
}
