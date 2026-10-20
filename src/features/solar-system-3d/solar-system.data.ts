// Scene data for the Three.js solar system page. Body sizes use the compressed
// radius (compressRadius, Earth = 0.5); orbit radii, orbit periods and spin
// periods are the compressed scene values from the build spec (section 3.1), in
// scene units and scene seconds. The order and ratios survive; the true scale
// does not, and the page says so. Facts follow NASA Solar System Exploration
// (science.nasa.gov); the copy is Bahasa Indonesia.

export type BodyId =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "ceres"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type BodyCopy = {
  type: string;
  atmosphere: string;
  distance: string;
  orbit: string;
  day: string;
  moons: string;
  temp: string;
  fact: string;
};

export type BodyDef = {
  id: BodyId;
  nameKey: string;
  displayRadius: number;
  orbitRadius: number | null;
  orbitPeriod: number | null;
  spinPeriod: number;
  spinRetrograde: boolean;
  axialTiltDeg: number;
  inclinationDeg: number;
  startAngleDeg: number;
  color: string;
  ringInner?: number;
  ringOuter?: number;
  copy: BodyCopy;
};

export const SCALE = {
  sunRadius: 3.5,
  earthRadius: 0.5,
  beltInner: 15,
  beltOuter: 19,
  kuiperInner: 47,
  kuiperOuter: 58,
} as const;

const EARTH_RADIUS_M = 6_371_000;

// Real radius in metres -> scene radius; Earth lands on exactly 0.5.
export function compressRadius(realRadiusMeters: number): number {
  return 0.5 * Math.sqrt(realRadiusMeters / EARTH_RADIUS_M);
}

export const BODIES: BodyDef[] = [
  {
    id: "sun",
    nameKey: "solarSystem3d.body.sun",
    displayRadius: SCALE.sunRadius,
    orbitRadius: null,
    orbitPeriod: null,
    spinPeriod: 120,
    spinRetrograde: false,
    axialTiltDeg: 7.25,
    inclinationDeg: 0,
    startAngleDeg: 0,
    color: "#e8a15b",
    copy: {
      type: "Bintang deret utama (G2V)",
      atmosphere: "Plasma: 73 persen hidrogen, 25 persen helium",
      distance: "Pusat Tata Surya (0 AU)",
      orbit: "Mengelilingi pusat galaksi dalam sekitar 230 juta tahun",
      day: "25 sampai 35 hari (rotasi berbeda per lintang)",
      moons: "0",
      temp: "5.500 \u00B0C di permukaan, 15 juta \u00B0C di inti",
      fact: "Matahari menampung 99,86 persen massa seluruh Tata Surya.",
    },
  },
  {
    id: "mercury",
    nameKey: "explore.planets.mercury.name",
    displayRadius: 0.31,
    orbitRadius: 6.0,
    orbitPeriod: 8,
    spinPeriod: 60,
    spinRetrograde: false,
    axialTiltDeg: 0.03,
    inclinationDeg: 7.0,
    startAngleDeg: 20,
    color: "#8c8680",
    copy: {
      type: "Planet kebumian",
      atmosphere: "Hampir tidak ada, hanya jejak tipis",
      distance: "0,39 AU (57,9 juta km)",
      orbit: "88 hari",
      day: "58,6 hari Bumi",
      moons: "0",
      temp: "Dari -180 \u00B0C malam sampai 430 \u00B0C siang",
      fact: "Planet terkecil, dengan lonjakan suhu paling ekstrem.",
    },
  },
  {
    id: "venus",
    nameKey: "explore.planets.venus.name",
    displayRadius: 0.49,
    orbitRadius: 8.0,
    orbitPeriod: 14,
    spinPeriod: 90,
    spinRetrograde: true,
    axialTiltDeg: 177.4,
    inclinationDeg: 3.4,
    startAngleDeg: 130,
    color: "#e8cda0",
    copy: {
      type: "Planet kebumian",
      atmosphere: "Karbon dioksida pekat, awan asam sulfat",
      distance: "0,72 AU (108,2 juta km)",
      orbit: "224,7 hari",
      day: "243 hari Bumi, berputar terbalik",
      moons: "0",
      temp: "Sekitar 465 \u00B0C, planet terpanas",
      fact: "Satu hari di Venus lebih lama daripada satu tahunnya.",
    },
  },
  {
    id: "earth",
    nameKey: "explore.planets.earth.name",
    displayRadius: 0.5,
    orbitRadius: 10.0,
    orbitPeriod: 20,
    spinPeriod: 10,
    spinRetrograde: false,
    axialTiltDeg: 23.4,
    inclinationDeg: 0,
    startAngleDeg: 250,
    color: "#1f5fa8",
    copy: {
      type: "Planet kebumian",
      atmosphere: "Nitrogen dan oksigen, air cair di permukaan",
      distance: "1,00 AU (149,6 juta km)",
      orbit: "365,25 hari",
      day: "23 jam 56 menit",
      moons: "1",
      temp: "Sekitar 15 \u00B0C rata-rata",
      fact: "Satu-satunya dunia yang diketahui punya kehidupan.",
    },
  },
  {
    id: "mars",
    nameKey: "explore.planets.mars.name",
    displayRadius: 0.36,
    orbitRadius: 12.5,
    orbitPeriod: 30,
    spinPeriod: 10,
    spinRetrograde: false,
    axialTiltDeg: 25.2,
    inclinationDeg: 1.85,
    startAngleDeg: 60,
    color: "#c1502e",
    copy: {
      type: "Planet kebumian",
      atmosphere: "Karbon dioksida tipis",
      distance: "1,52 AU (227,9 juta km)",
      orbit: "687 hari",
      day: "24 jam 37 menit",
      moons: "2",
      temp: "Sekitar -63 \u00B0C rata-rata",
      fact: "Olympus Mons, gunung berapi tertinggi yang diketahui.",
    },
  },
  {
    id: "ceres",
    nameKey: "solarSystem3d.body.ceres",
    displayRadius: 0.12,
    orbitRadius: 17.0,
    orbitPeriod: 45,
    spinPeriod: 45,
    spinRetrograde: false,
    axialTiltDeg: 4,
    inclinationDeg: 10.6,
    startAngleDeg: 285,
    color: "#8d8a85",
    copy: {
      type: "Planet kerdil, di sabuk asteroid",
      atmosphere: "Beku dan tipis, dengan uap air sesekali",
      distance: "2,77 AU",
      orbit: "4,6 tahun",
      day: "9 jam",
      moons: "0",
      temp: "Sekitar -105 \u00B0C",
      fact: "Objek terbesar di sabuk asteroid.",
    },
  },
  {
    id: "jupiter",
    nameKey: "explore.planets.jupiter.name",
    displayRadius: 1.66,
    orbitRadius: 24.0,
    orbitPeriod: 60,
    spinPeriod: 6,
    spinRetrograde: false,
    axialTiltDeg: 3.1,
    inclinationDeg: 1.3,
    startAngleDeg: 200,
    color: "#d8b48a",
    copy: {
      type: "Raksasa gas",
      atmosphere: "Hidrogen dan helium, awan berbalut",
      distance: "5,20 AU (778,5 juta km)",
      orbit: "11,86 tahun",
      day: "9 jam 56 menit",
      moons: "90+",
      temp: "Sekitar -110 \u00B0C di puncak awan",
      fact: "Bintik Merah Besar adalah badai yang sudah berusia lebih dari 150 tahun.",
    },
  },
  {
    id: "saturn",
    nameKey: "explore.planets.saturn.name",
    displayRadius: 1.51,
    orbitRadius: 32.0,
    orbitPeriod: 90,
    spinPeriod: 7,
    spinRetrograde: false,
    axialTiltDeg: 26.7,
    inclinationDeg: 2.5,
    startAngleDeg: 310,
    color: "#e5d3a1",
    ringInner: 1.67,
    ringOuter: 3.52,
    copy: {
      type: "Raksasa gas",
      atmosphere: "Hidrogen dan helium",
      distance: "9,58 AU (1,43 miliar km)",
      orbit: "29,4 tahun",
      day: "10 jam 34 menit",
      moons: "140+",
      temp: "Sekitar -140 \u00B0C",
      fact: "Kurang padat daripada air, dengan cincin paling megah.",
    },
  },
  {
    id: "uranus",
    nameKey: "explore.planets.uranus.name",
    displayRadius: 1.0,
    orbitRadius: 39.0,
    orbitPeriod: 130,
    spinPeriod: 9,
    spinRetrograde: true,
    axialTiltDeg: 97.8,
    inclinationDeg: 0.77,
    startAngleDeg: 100,
    color: "#a8e3e6",
    ringInner: 1.6,
    ringOuter: 2.0,
    copy: {
      type: "Raksasa es",
      atmosphere: "Hidrogen, helium, metana",
      distance: "19,2 AU (2,87 miliar km)",
      orbit: "84 tahun",
      day: "17 jam 14 menit, berputar terbalik",
      moons: "28",
      temp: "Sekitar -195 \u00B0C",
      fact: "Berputar miring 97,8 derajat, seperti menggelinding pada orbitnya.",
    },
  },
  {
    id: "neptune",
    nameKey: "explore.planets.neptune.name",
    displayRadius: 0.98,
    orbitRadius: 45.0,
    orbitPeriod: 170,
    spinPeriod: 8,
    spinRetrograde: false,
    axialTiltDeg: 28.3,
    inclinationDeg: 1.77,
    startAngleDeg: 40,
    color: "#3b57c9",
    ringInner: 1.7,
    ringOuter: 2.4,
    copy: {
      type: "Raksasa es",
      atmosphere: "Hidrogen, helium, metana",
      distance: "30,1 AU (4,5 miliar km)",
      orbit: "164,8 tahun",
      day: "16 jam 6 menit",
      moons: "16",
      temp: "Sekitar -200 \u00B0C",
      fact: "Angin tercepat di Tata Surya, sekitar 2.000 km per jam.",
    },
  },
  {
    id: "pluto",
    nameKey: "solarSystem3d.body.pluto",
    displayRadius: 0.22,
    orbitRadius: 51.0,
    orbitPeriod: 210,
    spinPeriod: 45,
    spinRetrograde: true,
    axialTiltDeg: 122.5,
    inclinationDeg: 17.2,
    startAngleDeg: 160,
    color: "#c9b49a",
    copy: {
      type: "Planet kerdil",
      atmosphere: "Nitrogen tipis, membeku saat jauh dari Matahari",
      distance: "39,5 AU (rata-rata, e=0,25)",
      orbit: "248 tahun",
      day: "6,4 hari Bumi, berputar terbalik",
      moons: "5",
      temp: "Sekitar -229 \u00B0C",
      fact: "Ditetapkan sebagai planet kerdil pada 2006, dengan gletser berbentuk hati.",
    },
  },
];

export function bodyById(id: BodyId): BodyDef | undefined {
  return BODIES.find((b) => b.id === id);
}
