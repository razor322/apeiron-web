// Scene data for the Three.js solar system page. Display radii are the real
// NASA diameters compressed with a square root (see compressRadius); orbit
// radii, orbit periods and spin periods are scene units chosen so the real
// ordering and ratios survive while the whole system fits one framed view.
// Ceres fixes the orbit-period scale (real 4.60 yr -> 45 scene seconds); every
// other period is its real period times that same factor. Facts follow NASA
// Solar System Exploration (science.nasa.gov); the copy is Bahasa Indonesia.
//
// NOTE: the task brief and plan point at a "section 3.1 master table" and
// "section 9 characteristics data" for these numbers, but neither table is
// present in the repository. The scene values here are derived from real,
// sourced NASA figures plus the exact constants the plan does give (SCALE,
// Ceres, the belt/kuiper bounds, the ring ranges and the retrograde flags).

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

// Ceres fixes the time scale: its real period is 4.60 yr, drawn as 45 s.
const CERES_REAL_PERIOD_S = 4.6 * 31_557_600;
const SCENE_SECONDS_PER_REAL_SECOND = 45 / CERES_REAL_PERIOD_S;

function orbitPeriodScene(realPeriodSeconds: number): number {
  return realPeriodSeconds * SCENE_SECONDS_PER_REAL_SECOND;
}

const YEAR_S = 31_557_600;
const DAY_S = 86_400;

const sunRadius = SCALE.sunRadius;
const marsRadius = compressRadius(3_389_500);
const ceresRadius = 0.12;
const jupiterRadius = compressRadius(69_911_000);
const saturnRadius = compressRadius(58_232_000);
const uranusRadius = compressRadius(25_362_000);
const neptuneRadius = compressRadius(24_622_000);
const plutoRadius = compressRadius(1_188_300);

export const BODIES: BodyDef[] = [
  {
    id: "sun",
    nameKey: "solarSystem3d.body.sun",
    displayRadius: sunRadius,
    orbitRadius: null,
    orbitPeriod: null,
    spinPeriod: 27 * DAY_S,
    spinRetrograde: false,
    axialTiltDeg: 7.25,
    inclinationDeg: 0,
    startAngleDeg: 0,
    color: "#e8a15b",
    copy: {
      type: "Bintang deret utama (G2V)",
      atmosphere: "Korona dan angin matahari, tanpa permukaan padat",
      distance: "Pusat Tata Surya (0 AU)",
      orbit: "Mengelilingi pusat galaksi dalam sekitar 230 juta tahun",
      day: "27 hari (satu rotasi di ekuator)",
      moons: "0",
      temp: "5.500 \u00B0C di permukaan, 15 juta \u00B0C di inti",
      fact: "Matahari menampung 99,8 persen massa seluruh Tata Surya.",
    },
  },
  {
    id: "mercury",
    nameKey: "explore.planets.mercury.name",
    displayRadius: compressRadius(2_439_500),
    orbitRadius: 6.0,
    orbitPeriod: orbitPeriodScene(88 * DAY_S),
    spinPeriod: 58.6 * DAY_S,
    spinRetrograde: false,
    axialTiltDeg: 0.03,
    inclinationDeg: 7.0,
    startAngleDeg: 20,
    color: "#9a9a9a",
    copy: {
      type: "Planet kebumian",
      atmosphere: "Hampir tanpa atmosfer, hanya jejak natrium dan helium",
      distance: "0,39 AU (57,9 juta km)",
      orbit: "88 hari",
      day: "176 hari Bumi (rotasi 58,6 hari)",
      moons: "0",
      temp: "167 \u00B0C rata-rata, dari -180 sampai 430 \u00B0C",
      fact: "Satu hari di Merkurius lebih lama daripada satu tahunnya.",
    },
  },
  {
    id: "venus",
    nameKey: "explore.planets.venus.name",
    displayRadius: compressRadius(6_051_800),
    orbitRadius: 8.5,
    orbitPeriod: orbitPeriodScene(224.7 * DAY_S),
    spinPeriod: -243 * DAY_S,
    spinRetrograde: true,
    axialTiltDeg: 177.4,
    inclinationDeg: 3.4,
    startAngleDeg: 60,
    color: "#d9b382",
    copy: {
      type: "Planet kebumian",
      atmosphere: "Karbon dioksida pekat dengan awan asam sulfat",
      distance: "0,72 AU (108,2 juta km)",
      orbit: "224,7 hari",
      day: "243 hari Bumi, berputar terbalik",
      moons: "0",
      temp: "464 \u00B0C, planet terpanas",
      fact: "Venus berputar berlawanan arah dan lebih lambat daripada orbitnya.",
    },
  },
  {
    id: "earth",
    nameKey: "explore.planets.earth.name",
    displayRadius: SCALE.earthRadius,
    orbitRadius: 11.5,
    orbitPeriod: orbitPeriodScene(365.25 * DAY_S),
    spinPeriod: DAY_S,
    spinRetrograde: false,
    axialTiltDeg: 23.44,
    inclinationDeg: 0,
    startAngleDeg: 100,
    color: "#5b8dd6",
    copy: {
      type: "Planet kebumian",
      atmosphere: "Nitrogen dan oksigen, satu-satunya yang bisa dihirup",
      distance: "1,00 AU (149,6 juta km)",
      orbit: "365,25 hari",
      day: "24 jam",
      moons: "1",
      temp: "15 \u00B0C rata-rata",
      fact: "Bumi satu-satunya planet yang airnya stabil dalam tiga wujud.",
    },
  },
  {
    id: "mars",
    nameKey: "explore.planets.mars.name",
    displayRadius: marsRadius,
    orbitRadius: 14.0,
    orbitPeriod: orbitPeriodScene(687 * DAY_S),
    spinPeriod: 1.03 * DAY_S,
    spinRetrograde: false,
    axialTiltDeg: 25.19,
    inclinationDeg: 1.85,
    startAngleDeg: 150,
    color: "#c1502e",
    copy: {
      type: "Planet kebumian",
      atmosphere: "Karbon dioksida tipis, tekanan kurang dari 1 persen Bumi",
      distance: "1,52 AU (227,9 juta km)",
      orbit: "687 hari",
      day: "24,6 jam",
      moons: "2",
      temp: "-65 \u00B0C rata-rata",
      fact: "Mars punya Olympus Mons, gunung berapi tertinggi di Tata Surya.",
    },
  },
  {
    id: "ceres",
    nameKey: "solarSystem3d.body.ceres",
    displayRadius: ceresRadius,
    orbitRadius: 17.0,
    orbitPeriod: 45,
    spinPeriod: 9.07 * 3600,
    spinRetrograde: false,
    axialTiltDeg: 4,
    inclinationDeg: 10.6,
    startAngleDeg: 200,
    color: "#8d8a85",
    copy: {
      type: "Planet kerdil (sabuk asteroid)",
      atmosphere: "Uap air sementara dari sublimasi es",
      distance: "2,77 AU (414 juta km)",
      orbit: "4,6 tahun",
      day: "9 jam",
      moons: "0",
      temp: "-105 \u00B0C rata-rata",
      fact: "Ceres menyimpan air sebanyak seluruh air tawar di Bumi.",
    },
  },
  {
    id: "jupiter",
    nameKey: "explore.planets.jupiter.name",
    displayRadius: jupiterRadius,
    orbitRadius: 22.5,
    orbitPeriod: orbitPeriodScene(11.9 * YEAR_S),
    spinPeriod: 0.41 * DAY_S,
    spinRetrograde: false,
    axialTiltDeg: 3.13,
    inclinationDeg: 1.3,
    startAngleDeg: 250,
    color: "#d8a97a",
    copy: {
      type: "Raksasa gas",
      atmosphere: "Hidrogen dan helium dengan pita awan dan Bintik Merah Besar",
      distance: "5,20 AU (778,5 juta km)",
      orbit: "11,9 tahun",
      day: "9,9 jam, tercepat di Tata Surya",
      moons: "90+",
      temp: "-110 \u00B0C di puncak awan",
      fact: "Bintik Merah Besar adalah badai yang sudah berlangsung berabad-abad.",
    },
  },
  {
    id: "saturn",
    nameKey: "explore.planets.saturn.name",
    displayRadius: saturnRadius,
    orbitRadius: 28.0,
    orbitPeriod: orbitPeriodScene(29.4 * YEAR_S),
    spinPeriod: 0.44 * DAY_S,
    spinRetrograde: false,
    axialTiltDeg: 26.73,
    inclinationDeg: 2.49,
    startAngleDeg: 300,
    color: "#e0c68a",
    ringInner: 1.67,
    ringOuter: 3.52,
    copy: {
      type: "Raksasa gas",
      atmosphere: "Hidrogen dan helium dengan pita awan keemasan",
      distance: "9,54 AU (1,43 miliar km)",
      orbit: "29,4 tahun",
      day: "10,7 jam",
      moons: "140+",
      temp: "-140 \u00B0C rata-rata",
      fact: "Cincin Saturnus terbentang lebar tapi hanya setebal puluhan meter.",
    },
  },
  {
    id: "uranus",
    nameKey: "explore.planets.uranus.name",
    displayRadius: uranusRadius,
    orbitRadius: 34.0,
    orbitPeriod: orbitPeriodScene(84 * YEAR_S),
    spinPeriod: -0.72 * DAY_S,
    spinRetrograde: true,
    axialTiltDeg: 97.77,
    inclinationDeg: 0.77,
    startAngleDeg: 350,
    color: "#8fd3d6",
    ringInner: 1.6,
    ringOuter: 2.0,
    copy: {
      type: "Raksasa es",
      atmosphere: "Hidrogen, helium dan metana yang memberi warna biru pucat",
      distance: "19,19 AU (2,87 miliar km)",
      orbit: "84 tahun",
      day: "17,2 jam, berputar terbalik",
      moons: "28",
      temp: "-195 \u00B0C rata-rata",
      fact: "Uranus berputar miring 98 derajat, hampir menggelinding pada orbitnya.",
    },
  },
  {
    id: "neptune",
    nameKey: "explore.planets.neptune.name",
    displayRadius: neptuneRadius,
    orbitRadius: 39.0,
    orbitPeriod: orbitPeriodScene(165 * YEAR_S),
    spinPeriod: 0.67 * DAY_S,
    spinRetrograde: false,
    axialTiltDeg: 28.32,
    inclinationDeg: 1.77,
    startAngleDeg: 30,
    color: "#5a76d6",
    ringInner: 1.7,
    ringOuter: 2.4,
    copy: {
      type: "Raksasa es",
      atmosphere: "Hidrogen, helium dan metana, angin tercepat di Tata Surya",
      distance: "30,07 AU (4,50 miliar km)",
      orbit: "165 tahun",
      day: "16,1 jam",
      moons: "16",
      temp: "-200 \u00B0C rata-rata",
      fact: "Angin di Neptunus bisa menembus 2.000 km per jam.",
    },
  },
  {
    id: "pluto",
    nameKey: "solarSystem3d.body.pluto",
    displayRadius: plutoRadius,
    orbitRadius: 44.0,
    orbitPeriod: orbitPeriodScene(248 * YEAR_S),
    spinPeriod: -6.39 * DAY_S,
    spinRetrograde: true,
    axialTiltDeg: 122.5,
    inclinationDeg: 17.16,
    startAngleDeg: 90,
    color: "#c9b7a4",
    copy: {
      type: "Planet kerdil (Sabuk Kuiper)",
      atmosphere: "Nitrogen dan metana tipis yang membeku saat jauh dari Matahari",
      distance: "39,48 AU (5,91 miliar km)",
      orbit: "248 tahun",
      day: "6,4 hari Bumi, berputar terbalik",
      moons: "5",
      temp: "-225 \u00B0C rata-rata",
      fact: "Pluto punya Tombaugh Regio, dataran berbentuk hati berwarna terang.",
    },
  },
];

export function bodyById(id: BodyId): BodyDef | undefined {
  return BODIES.find((b) => b.id === id);
}
