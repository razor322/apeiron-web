# Texture licenses

Textures for the `/{locale}/solar-system-3d` page. Each file records its origin
and license. Bodies with no verified, cleanly licensed equirectangular map use a
procedural surface generated in code (`src/features/solar-system-3d/bodies/procedural.ts`)
in the planet's exact colours.

## Files

| File | Source | License |
|---|---|---|
| `earth_atmos_2048.jpg` | three.js examples, `examples/textures/planets/earth_atmos_2048.jpg` | MIT (bundled with three.js examples) |
| `earth_clouds_1024.png` | three.js examples, `examples/textures/planets/earth_clouds_1024.png` | MIT (bundled with three.js examples) |
| `earth_lights_2048.png` | three.js examples, `examples/textures/planets/earth_lights_2048.png` | MIT (bundled with three.js examples) |
| `earth_specular_2048.jpg` | three.js examples, `examples/textures/planets/earth_specular_2048.jpg` | MIT (bundled with three.js examples) |
| `earth_normal_2048.jpg` | three.js examples, `examples/textures/planets/earth_normal_2048.jpg` | MIT (bundled with three.js examples) |
| `moon_1024.jpg` | three.js examples, `examples/textures/planets/moon_1024.jpg` | MIT (bundled with three.js examples) |
| `moon_lro_1k.jpg` | NASA Scientific Visualization Studio, `svs.gsfc.nasa.gov` LRO colour poles map | NASA public domain |
| `mars_1k.jpg` | NASA NSSDC image library, Mars globe | NASA public domain |

NASA material is generally not copyrighted; see https://www.nasa.gov/nasa-brand-center/images-and-media/.

## Textured vs procedural

- Textured (equirectangular map shipped in this folder, mapped onto the globe): Earth, Moon.
- Procedural (no verified, cleanly licensed equirectangular NASA map reachable at build time): Sun, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto. Each uses `proceduralTexture(kind, colors)` with the exact colours from `solar-system.data.ts`. Mars ships `mars_1k.jpg` (a 1552x1552 globe photo, not an equirectangular map, so unsuitable as a sphere texture); it is kept for the info card or poster and Mars renders procedurally. If a suitable NASA equirectangular map is verified later, drop the file here, extend this table, and wire the body to it.

## Ring strips

The planet rings are built at runtime from a procedural `DataTexture` in
`src/features/solar-system-3d/shaderstrips.ts` (the `sampleRingStrip` table), so
no ring image file is shipped. Nothing to license.
