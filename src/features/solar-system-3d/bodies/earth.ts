import * as THREE from "three";
import { SCALE } from "../solar-system.data";

// Textured Earth: a day-lit surface, a slightly larger cloud shell that spins a
// touch faster, night lights that fade in on the dark side, and a fresnel
// atmosphere rim. Earth is the only body with real textures; everything else
// uses the procedural generators.
//
// The night lights are blended inside the day material through onBeforeCompile
// so the terminator stays smooth: the map fades in where the surface normal
// turns away from the Sun, and never shows on the lit side.

export const CLOUD_RADIUS_RATIO = 1.01;
export const ATMOSPHERE_RADIUS_RATIO = 1.06;

const EARTH_RADIUS = SCALE.earthRadius;

const TEXTURES = {
  day: "/textures/earth_atmos_2048.jpg",
  clouds: "/textures/earth_clouds_1024.png",
  night: "/textures/earth_lights_2048.png",
} as const;

// 0 on the day side, 1 on the night side, smooth across the terminator.
export function nightBlendFactor(
  normal: THREE.Vector3,
  sunDir: THREE.Vector3,
): number {
  const d = normal.dot(sunDir);
  const t = THREE.MathUtils.clamp(0.5 - d * 0.5, 0, 1);
  return t * t * (3 - 2 * t);
}

type EarthUniforms = {
  uSunDirObj: { value: THREE.Vector3 };
  uNightMap: { value: THREE.Texture | null };
};

function patchDayMaterial(
  material: THREE.MeshStandardMaterial,
  nightMap: THREE.Texture | null,
): EarthUniforms {
  const uniforms: EarthUniforms = {
    uSunDirObj: { value: new THREE.Vector3(1, 0, 0) },
    uNightMap: { value: nightMap },
  };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSunDirObj = uniforms.uSunDirObj;
    shader.uniforms.uNightMap = uniforms.uNightMap;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vObjNormal;",
      )
      .replace(
        "#include <beginnormal_vertex>",
        "#include <beginnormal_vertex>\nvObjNormal = objectNormal;",
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        [
          "#include <common>",
          "uniform vec3 uSunDirObj;",
          "uniform sampler2D uNightMap;",
          "varying vec3 vObjNormal;",
        ].join("\n"),
      )
      .replace(
        "#include <dithering_fragment>",
        [
          "#include <dithering_fragment>",
          "{",
          "  float d = dot(normalize(vObjNormal), normalize(uSunDirObj));",
          "  float night = clamp(0.5 - d * 0.5, 0.0, 1.0);",
          "  night = night * night * (3.0 - 2.0 * night);",
          "  vec3 lights = texture2D(uNightMap, vMapUv).rgb;",
          "  gl_FragColor.rgb += lights * night * 1.4;",
          "}",
        ].join("\n"),
      );
  };
  // Forces a distinct program so the patch does not collide with the plain
  // standard material cache entry.
  material.customProgramCacheKey = () => "earth-day-night";

  return uniforms;
}

function createAtmosphere(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS * ATMOSPHERE_RADIUS_RATIO, 64, 64);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color("#4f8fe8") },
      uSunDirObj: { value: new THREE.Vector3(1, 0, 0) },
    },
    vertexShader: [
      "varying vec3 vObjNormal;",
      "varying vec3 vViewNormal;",
      "void main() {",
      "  vObjNormal = objectNormal;",
      "  vViewNormal = normalize(normalMatrix * objectNormal);",
      "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
      "}",
    ].join("\n"),
    fragmentShader: [
      "uniform vec3 uColor;",
      "uniform vec3 uSunDirObj;",
      "varying vec3 vObjNormal;",
      "varying vec3 vViewNormal;",
      "void main() {",
      "  float fresnel = pow(1.0 - abs(vViewNormal.z), 3.0);",
      "  float lit = clamp(dot(normalize(vObjNormal), normalize(uSunDirObj)) + 0.35, 0.0, 1.0);",
      "  gl_FragColor = vec4(uColor * fresnel * lit, fresnel * 0.9);",
      "}",
    ].join("\n"),
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "earth-atmosphere";
  return mesh;
}

export function createEarth(loader: THREE.TextureLoader): {
  group: THREE.Group;
  update: (sunDir: THREE.Vector3, simTime?: number) => void;
} {
  const group = new THREE.Group();
  group.name = "earth";

  const dayMap = loader.load(TEXTURES.day);
  dayMap.colorSpace = THREE.SRGBColorSpace;
  const nightMap = loader.load(TEXTURES.night);
  nightMap.colorSpace = THREE.SRGBColorSpace;
  const cloudMap = loader.load(TEXTURES.clouds);
  cloudMap.colorSpace = THREE.SRGBColorSpace;

  const dayMaterial = new THREE.MeshStandardMaterial({
    map: dayMap,
    roughness: 0.9,
    metalness: 0,
  });
  const uniforms = patchDayMaterial(dayMaterial, nightMap);

  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS, 64, 64),
    dayMaterial,
  );
  surface.name = "earth-surface";
  group.add(surface);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * CLOUD_RADIUS_RATIO, 64, 64),
    new THREE.MeshStandardMaterial({
      map: cloudMap,
      transparent: true,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
    }),
  );
  clouds.name = "earth-clouds";
  group.add(clouds);

  const atmosphere = createAtmosphere();
  group.add(atmosphere);

  const localSun = new THREE.Vector3();
  const inverse = new THREE.Matrix4();
  const atmosphereUniforms = (atmosphere.material as THREE.ShaderMaterial).uniforms;

  const update = (sunDir: THREE.Vector3, simTime = 0): void => {
    // Sun direction in the day mesh's local frame, so the shader can compare it
    // against the object-space normal it already has.
    surface.updateWorldMatrix(true, false);
    inverse.copy(surface.matrixWorld).invert();
    localSun.copy(sunDir).transformDirection(inverse);
    uniforms.uSunDirObj.value.copy(localSun);
    (atmosphereUniforms.uSunDirObj as { value: THREE.Vector3 }).value.copy(localSun);

    // The cloud shell drifts a little faster than the surface, so weather
    // visibly overtakes the ground.
    clouds.rotation.y = simTime * 0.02;
  };

  return { group, update };
}
