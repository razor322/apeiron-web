import * as THREE from "three";
import { type BodyDef } from "../solar-system.data";

// Scene graph for one orbiting body, matching spec section 3.2:
//   orbitPlane (rotation.x = inclination)  <- the tilted orbital plane
//     orbitPivot (position set per frame)  <- the body's place on that plane
//       tilt (rotation.z = axial tilt)     <- carried on a group, never the mesh
//         spin (mesh, rotation.y)          <- the daily rotation
// plus a LineLoop of the orbit path, added to orbitPlane so it tilts with it.
//
// The pure helpers below (orbitPosition, spinSign, spinAngle, orbitLinePoints)
// hold all the maths and are unit tested; applyBodyStep just writes their
// results onto the live objects once per frame.

export const ORBIT_SEGMENTS = 256;

const TWO_PI = Math.PI * 2;
const DEG2RAD = Math.PI / 180;

export type BodyView = {
  def: BodyDef;
  group: THREE.Group;
  orbitPlane: THREE.Group;
  orbitPivot: THREE.Group;
  tilt: THREE.Group;
  spin: THREE.Object3D;
  orbitLine: THREE.LineLoop;
};

// x = r cos theta, z = -r sin theta, so theta grows counter-clockwise seen from
// +Y (the camera looks down the +Y axis from above the ecliptic).
export function orbitPosition(
  def: BodyDef,
  simTime: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  const r = def.orbitRadius ?? 0;
  const period = def.orbitPeriod ?? 1;
  const theta = def.startAngleDeg * DEG2RAD + (TWO_PI * simTime) / period;
  return out.set(r * Math.cos(theta), 0, -r * Math.sin(theta));
}

export function spinSign(def: BodyDef): 1 | -1 {
  return def.spinRetrograde ? -1 : 1;
}

export function spinAngle(def: BodyDef, simTime: number): number {
  const period = def.spinPeriod || 1;
  return spinSign(def) * ((TWO_PI * simTime) / period);
}

// A closed loop: the first point is repeated at the end so the wrap is exact.
export function orbitLinePoints(def: BodyDef): THREE.Vector3[] {
  const r = def.orbitRadius ?? 0;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= ORBIT_SEGMENTS; i += 1) {
    const theta = (i / ORBIT_SEGMENTS) * TWO_PI;
    points.push(new THREE.Vector3(r * Math.cos(theta), 0, -r * Math.sin(theta)));
  }
  return points;
}

function createOrbitLine(def: BodyDef): THREE.LineLoop {
  const geometry = new THREE.BufferGeometry().setFromPoints(orbitLinePoints(def));
  const material = new THREE.LineBasicMaterial({
    color: "#ffffff",
    opacity: 0.1,
    transparent: true,
    depthWrite: false,
  });
  const line = new THREE.LineLoop(geometry, material);
  line.renderOrder = -1;
  return line;
}

// Oblate flattening for the two gas giants whose polar squash is visible.
function flatteningFor(def: BodyDef): number {
  if (def.id === "jupiter") return 0.935;
  if (def.id === "saturn") return 0.9;
  return 1;
}

export type BodyAppearance = {
  material: THREE.Material;
  spin?: THREE.Object3D;
};

export function createBody(def: BodyDef, appearance?: BodyAppearance): BodyView {
  const group = new THREE.Group();
  group.name = def.id;

  const orbitPlane = new THREE.Group();
  orbitPlane.rotation.x = def.inclinationDeg * DEG2RAD;
  group.add(orbitPlane);

  const orbitPivot = new THREE.Group();
  orbitPlane.add(orbitPivot);

  const tilt = new THREE.Group();
  tilt.rotation.z = def.axialTiltDeg * DEG2RAD;
  orbitPivot.add(tilt);

  let spin: THREE.Object3D;
  if (appearance?.spin) {
    spin = appearance.spin;
    tilt.add(spin);
  } else {
    const geometry = new THREE.SphereGeometry(def.displayRadius, 64, 64);
    const material =
      appearance?.material ??
      new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.9 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.y = flatteningFor(def);
    spin = mesh;
    tilt.add(spin);
  }

  const orbitLine = createOrbitLine(def);
  orbitPlane.add(orbitLine);

  const view: BodyView = { def, group, orbitPlane, orbitPivot, tilt, spin, orbitLine };

  const scratch = new THREE.Vector3();
  orbitPosition(def, 0, scratch);
  orbitPivot.position.copy(scratch);

  return view;
}

// Advance one body by the current sim time. The Sun (null orbit) is skipped by
// the caller, so this assumes a real orbit.
export function applyBodyStep(view: BodyView, simTime: number, scratch: THREE.Vector3): void {
  orbitPosition(view.def, simTime, scratch);
  view.orbitPivot.position.copy(scratch);
  view.spin.rotation.y = spinAngle(view.def, simTime);
}
