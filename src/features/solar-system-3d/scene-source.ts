import { PLANET_GSS, SUN_GSS } from "./planet-gss";

// The GSS stylesheet for the 3D solar system: a row of spheres, the Sun first,
// each planet on its x, floating gently. Each planet gets its own bob keyframe
// that carries the planet's own x, so the float moves it up and down in place
// and never slides it toward the centre. Motion stops entirely for a reader who
// asks for less. GSS speaks a CSS dialect; the shapes, colours, and @keyframes
// below are its vocabulary.
export function buildSceneSource(): string {
  const objects = [SUN_GSS.id, ...PLANET_GSS.map((p) => p.id)]
    .map((id) => `  sphere#${id};`)
    .join("\n");

  const rules = [
    `#${SUN_GSS.id} {\n  radius: ${SUN_GSS.radius};\n  color: ${SUN_GSS.color};\n  translate: 0 1.4 0;\n}`,
    ...PLANET_GSS.map(
      (p) =>
        `#${p.id} {\n  radius: ${p.radius};\n  color: ${p.color};\n  translate: ${p.x} 1.3 0;\n  animation: bob-${p.slug} 3s ease-in-out alternate;\n}`,
    ),
  ].join("\n\n");

  const keyframes = PLANET_GSS.map(
    (p) =>
      `@keyframes bob-${p.slug} {\n  to {\n    translate: ${p.x} 1.5 0;\n  }\n}`,
  ).join("\n\n");

  return `@scene {
${objects}
}

${rules}

${keyframes}

@media (prefers-reduced-motion) {
  * {
    animation: none !important;
  }
}
`;
}
