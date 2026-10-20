import * as THREE from "three";
import type { BodyId } from "./solar-system.data";

// Tier 2 satellites (build spec sections 4 and 6). Each moon is a small sphere
// on a circular orbit that lives inside its planet's `tilt` group, so it orbits
// in the planet's tilted equatorial plane rather than the ecliptic. All radii,
// orbit radii, periods and colours are the spec scene values; sizes stay
// visible at scene scale rather than true scale.
//
// The pure helpers below (moonPosition) hold the maths and are unit tested;
// createMoons only builds the meshes and writes the position once per frame.

const TWO_PI = Math.PI * 2;

export type MoonDef = {
  id: string;
  parentId: BodyId;
  radius: number;
  orbitRadius: number;
  orbitPeriod: number;
  color: string;
  retrograde: boolean;
  tidallyLocked: boolean;
};

export const MOONS: MoonDef[] = [
  {
    id: "moon",
    parentId: "earth",
    radius: 0.14,
    orbitRadius: 1.0,
    orbitPeriod: 4,
    color: "#9c9a94",
    retrograde: false,
    tidallyLocked: true,
  },
  {
    id: "io",
    parentId: "jupiter",
    radius: 0.1,
    orbitRadius: 2.3,
    orbitPeriod: 5,
    color: "#e6c34a",
    retrograde: false,
    tidallyLocked: false,
  },
  {
    id: "europa",
    parentId: "jupiter",
    radius: 0.09,
    orbitRadius: 2.8,
    orbitPeriod: 8,
    color: "#d8cbb4",
    retrograde: false,
    tidallyLocked: false,
  },
  {
    id: "ganymede",
    parentId: "jupiter",
    radius: 0.13,
    orbitRadius: 3.4,
    orbitPeriod: 13,
    color: "#8f8576",
    retrograde: false,
    tidallyLocked: false,
  },
  {
    id: "callisto",
    parentId: "jupiter",
    radius: 0.12,
    orbitRadius: 4.0,
    orbitPeriod: 24,
    color: "#5e554b",
    retrograde: false,
    tidallyLocked: false,
  },
  {
    id: "titan",
    parentId: "saturn",
    radius: 0.13,
    orbitRadius: 4.3,
    orbitPeriod: 16,
    color: "#d99a3d",
    retrograde: false,
    tidallyLocked: false,
  },
  {
    id: "triton",
    parentId: "neptune",
    radius: 0.1,
    orbitRadius: 1.9,
    orbitPeriod: 6,
    color: "#cdb9a6",
    retrograde: true,
    tidallyLocked: false,
  },
  {
    id: "charon",
    parentId: "pluto",
    radius: 0.11,
    orbitRadius: 0.6,
    orbitPeriod: 5,
    color: "#8f8a88",
    retrograde: false,
    tidallyLocked: true,
  },
  {
    id: "phobos",
    parentId: "mars",
    radius: 0.05,
    orbitRadius: 0.9,
    orbitPeriod: 3,
    color: "#6b625a",
    retrograde: false,
    tidallyLocked: true,
  },
  {
    id: "deimos",
    parentId: "mars",
    radius: 0.04,
    orbitRadius: 1.3,
    orbitPeriod: 5,
    color: "#6b625a",
    retrograde: false,
    tidallyLocked: true,
  },
];

export function moonById(id: string): MoonDef | undefined {
  return MOONS.find((m) => m.id === id);
}

// Same convention as orbitPosition (x = r cos theta, z = -r sin theta), but the
// angle is measured from the moon's own zero rather than a start angle. A
// retrograde moon flips the sign of theta so it runs the other way round.
export function moonPosition(def: MoonDef, simTime: number, out: THREE.Vector3): THREE.Vector3 {
  const sign = def.retrograde ? -1 : 1;
  const theta = sign * ((TWO_PI * simTime) / def.orbitPeriod);
  return out.set(def.orbitRadius * Math.cos(theta), 0, -def.orbitRadius * Math.sin(theta));
}

export type MoonView = {
  def: MoonDef;
  pivot: THREE.Group;
};

// One group per moon so the whole set toggles with a single visibility flag per
// pivot. The sphere is a child of the pivot; the pivot moves each frame. The
// group starts hidden: moons are a tier 2 feature, off on the default view.
export function createMoons(defs: MoonDef[], planetRadius: number): THREE.Group {
  void planetRadius;
  const group = new THREE.Group();
  group.name = "moons";
  group.visible = false;

  for (const def of defs) {
    const pivot = new THREE.Group();
    pivot.name = def.id;

    const geometry = new THREE.SphereGeometry(def.radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.95 });
    const mesh = new THREE.Mesh(geometry, material);
    pivot.add(mesh);

    const scratch = new THREE.Vector3();
    moonPosition(def, 0, scratch);
    pivot.position.copy(scratch);

    group.add(pivot);
  }

  return group;
}

// Advance every moon of one planet. The view list holds the pivot plus its def,
// so a single pass writes each local position inside the shared tilt group.
export function applyMoonStep(
  views: { def: MoonDef; pivot: THREE.Group }[],
  simTime: number,
  scratch: THREE.Vector3,
): void {
  for (const { def, pivot } of views) {
    moonPosition(def, simTime, scratch);
    pivot.position.copy(scratch);
  }
}
