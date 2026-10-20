import * as THREE from "three";

// Picking against invisible hit proxies so the tiny bodies (Ceres, Pluto, the
// moons) stay clickable when the real sphere is only a few pixels across. The
// pure helpers below (proxyRadius, focusDistance, isBehindSun) hold the maths
// and are unit tested; attachPicking only wires the raycaster, the pointer
// cursor and the event callbacks.

export type PickProxy = {
  /** The body id this proxy stands in for. */
  id: string;
  mesh: THREE.Object3D;
};

// A proxy swell that keeps a body clickable: scale the real radius up until a
// body subtends at least a pixel floor at the default framing. Pure so the
// bump is testable without a renderer.
export const PROXY_MIN_RADIUS = 0.4;

export function proxyRadius(displayRadius: number): number {
  return Math.max(displayRadius, PROXY_MIN_RADIUS);
}

// Focus distance for a body: proportional to its extent (radius plus the ring
// outer radius when it has rings), clamped to the camera's own zoom limits so a
// focus never flies inside the near plane or past the outer system.
export const FOCUS_K = 4.5;

export function focusDistance(
  radialExtent: number,
  minDistance: number,
  maxDistance: number,
): number {
  const raw = FOCUS_K * radialExtent;
  return Math.min(Math.max(raw, minDistance), maxDistance);
}

// A body is hidden when the Sun sits between the camera and the body along the
// same line of sight: the body is farther than the Sun and its direction from
// the camera is within `tan` of the Sun's. `tan` is the sine of the angular
// radius of the Sun's occluding disc as seen from the camera, widened a touch
// so the label pops out just before the body would be fully covered.
const scratchToBody = new THREE.Vector3();
const scratchToSun = new THREE.Vector3();

export function isBehindSun(
  bodyPos: THREE.Vector3,
  cameraPos: THREE.Vector3,
  sinTolerance: number,
): boolean {
  const toBody = scratchToBody.subVectors(bodyPos, cameraPos);
  const toSun = scratchToSun.copy(cameraPos).negate();
  const bodyDist = toBody.length();
  const sunDist = toSun.length();
  if (bodyDist === 0 || sunDist === 0) return false;
  if (bodyDist <= sunDist) return false;
  toBody.multiplyScalar(1 / bodyDist);
  toSun.multiplyScalar(1 / sunDist);
  const sin = Math.sqrt(Math.max(0, 1 - Math.min(1, toBody.dot(toSun)) ** 2));
  return sin <= sinTolerance;
}

export type PickingHandles = {
  /** The live raycaster, for tests and advanced callers. */
  raycaster: THREE.Raycaster;
  /** Recomputes hover state from a pointer position in CSS pixels. */
  update: (clientX: number, clientY: number) => void;
  /** Runs the click path at the last hovered pointer position. */
  click: () => void;
  /** Pointer handler bound to the element; attached by the caller. */
  handlePointerMove: (event: { clientX: number; clientY: number }) => void;
  handleClick: () => void;
  dispose: () => void;
};

// Wires picking to a DOM element: a raycaster over the proxy meshes, pointer
// cursor on hover, and hover / select callbacks. The caller passes the proxies
// and the two callbacks; nothing here reads the raw provider or the DOM styles.
export function attachPicking(
  camera: THREE.Camera,
  domElement: HTMLElement,
  proxies: PickProxy[],
  callbacks: {
    onHover: (id: string | null) => void;
    onSelect: (id: string) => void;
  },
): PickingHandles {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered: string | null = null;

  const hitId = (clientX: number, clientY: number): string | null => {
    const rect = domElement.getBoundingClientRect();
    const width = rect.width || 1;
    const height = rect.height || 1;
    pointer.x = ((clientX - rect.left) / width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const meshes = proxies.map((p) => p.mesh);
    const hits = raycaster.intersectObjects(meshes, false);
    const first = hits[0];
    if (!first) return null;
    const proxy = proxies.find((p) => p.mesh === first.object);
    return proxy ? proxy.id : null;
  };

  const update = (clientX: number, clientY: number): void => {
    const id = hitId(clientX, clientY);
    if (id === hovered) return;
    hovered = id;
    domElement.style.cursor = id ? "pointer" : "";
    callbacks.onHover(id);
  };

  const click = (): void => {
    if (hovered) callbacks.onSelect(hovered);
  };

  return {
    raycaster,
    update,
    click,
    handlePointerMove: (event) => update(event.clientX, event.clientY),
    handleClick: click,
    dispose: () => {
      domElement.style.cursor = "";
    },
  };
}
