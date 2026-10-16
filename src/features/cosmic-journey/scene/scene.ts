// Canvas render for the cosmic journey. No React: the orchestrator lazy-loads
// this module with a dynamic import() inside an effect, so the heavy drawing
// code never blocks first paint. Everything here is decorative (the canvas is
// aria-hidden); the accessible story lives in the DOM text panels.

export type SceneHandle = {
  render: (progress: number, timeSeconds: number) => void;
  destroy: () => void;
};

const TAU = Math.PI * 2;
const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const AU = 1.496e11;
const RE = 6.371e6;
const RS = 6.957e8;
const LM = 3.844e8;
const RM = 1.737e6;

const ORBITS = [5.79e10, 1.082e11, AU, 2.279e11, 7.785e11, 1.434e12, 2.871e12, 4.495e12];
const PLANETS = [
  { n: "Mercury", a: 5.79e10, r: 2.44e6, ang: 2.2, lab: 0 },
  { n: "Venus", a: 1.082e11, r: 6.05e6, ang: 4.1, lab: 0 },
  { n: "Mars", a: 2.279e11, r: 3.39e6, ang: 1.15, lab: 0 },
  { n: "Jupiter", a: 7.785e11, r: 6.99e7, ang: 2.65, lab: 1 },
  { n: "Saturn", a: 1.434e12, r: 5.82e7, ang: 5.1, lab: 1 },
  { n: "Uranus", a: 2.871e12, r: 2.54e7, ang: 0.6, lab: 1 },
  { n: "Neptune", a: 4.495e12, r: 2.46e7, ang: 3.7, lab: 1 },
];

// Screen width, in metres, as a function of scroll progress. The first ten
// keyframes mirror the prototype's journey curve (Earth to Proxima); the last
// three carry the zoom on out to the Milky Way and the observable universe.
const KEYFRAMES: [number, number][] = [
  [0, 0.3],
  [0.07, 0.3],
  [0.17, 5.2],
  [0.28, 7.2],
  [0.38, 7.2],
  [0.5, 9.2],
  [0.57, 9.2],
  [0.68, 11.3],
  [0.74, 11.3],
  [0.86, 13.05],
  [0.9, 13.05],
  [0.94, 21],
  [0.97, 27],
  [1, 27],
];

function exponentAt(progress: number): number {
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const [p0, e0] = KEYFRAMES[i]!;
    const [p1, e1] = KEYFRAMES[i + 1]!;
    if (progress <= p1) {
      const t = clamp((progress - p0) / (p1 - p0));
      return e0 + (e1 - e0) * (t * 0.35 + t * t * (3 - 2 * t) * 0.65);
    }
  }
  return KEYFRAMES[KEYFRAMES.length - 1]![1];
}

function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rngStars = seeded(42);
const ALL_STARS = Array.from({ length: 460 }, () => {
  const big = rngStars() < 0.07;
  return {
    x: rngStars(),
    y: rngStars(),
    s: big ? 1.6 : rngStars() < 0.5 ? 1 : 0.7,
    a: 0.25 + rngStars() * 0.65,
    w: rngStars() < 0.06,
    sp: 0.4 + rngStars() * 1.6,
    ph: rngStars() * TAU,
  };
});

// Surface blobs for the Earth disc: continents, cloud banks, and a few dark
// ocean patches, all seeded so the planet is the same every render. Placed in a
// unit disc (x,y in [-1,1]) and scaled to the drawn radius.
const BLOB_COLORS = [
  "rgba(110,140,115,0.20)",
  "rgba(110,140,115,0.16)",
  "rgba(235,240,255,0.08)",
  "rgba(8,16,34,0.28)",
];
const rngBlobs = seeded(7);
const ALL_BLOBS = Array.from({ length: 80 }, () => {
  const angle = rngBlobs() * TAU;
  const dist = Math.sqrt(rngBlobs()) * 0.92;
  const rx = 0.04 + rngBlobs() * 0.18;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    rx,
    ry: rx * (0.35 + rngBlobs() * 0.65),
    rot: rngBlobs() * Math.PI,
    c: BLOB_COLORS[(rngBlobs() * BLOB_COLORS.length) | 0]!,
  };
});

// Deep-field galaxies for the observable-universe stage: a separate seeded set
// (sharp points and faint smudges), independent of the star field.
const rngGalaxies = seeded(1234);
const GALAXY_TINTS = [
  "rgba(255,244,222,0.9)",
  "rgba(255,225,190,0.85)",
  "rgba(210,220,255,0.8)",
  "rgba(235,235,245,0.75)",
];
const ALL_GALAXIES = Array.from({ length: 260 }, () => {
  const blur = rngGalaxies() < 0.35;
  return {
    x: rngGalaxies(),
    y: rngGalaxies(),
    r: blur ? 2.2 + rngGalaxies() * 3.2 : 0.7 + rngGalaxies() * 1.1,
    a: blur ? 0.16 + rngGalaxies() * 0.22 : 0.5 + rngGalaxies() * 0.5,
    smudge: blur,
    tint: GALAXY_TINTS[(rngGalaxies() * GALAXY_TINTS.length) | 0]!,
  };
});

// Static stars for the Milky Way arms, seeded once so the galaxy is stable
// (unit space along a log spiral; scaled and tilted at draw time). Four arms:
// two major, two minor.
type ArmStar = { arm: number; u: number; ang: number; spread: number; size: number; warm: boolean; bright: number };
const rngArms = seeded(99);
const ARM_COUNT = 4;
const ALL_ARM_STARS: ArmStar[] = Array.from({ length: 1400 }, () => {
  const arm = (rngArms() * ARM_COUNT) | 0;
  const u = rngArms();
  return {
    arm,
    u,
    ang: rngArms(),
    spread: rngArms() - 0.5,
    size: 0.6 + rngArms() * 1.5,
    warm: rngArms() < 0.4,
    bright: 0.28 + rngArms() * 0.5,
  };
});

// Adaptive quality: weak devices (<=4 cores) and narrow viewports draw fewer
// stars, blobs, and galaxies at lower device pixel ratio. One factor, one place.
function quality(): { dprCap: number; stars: number; blobs: number; galaxies: number; arms: number } {
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : undefined;
  const weak = typeof cores === "number" && cores <= 4;
  const narrow = typeof window !== "undefined" && window.innerWidth < 768;
  if (weak || narrow)
    return { dprCap: 1, stars: 240, blobs: 44, galaxies: 150, arms: 260 };
  return {
    dprCap: 2,
    stars: ALL_STARS.length,
    blobs: ALL_BLOBS.length,
    galaxies: ALL_GALAXIES.length,
    arms: 420,
  };
}

export function createScene(canvas: HTMLCanvasElement): SceneHandle {
  const context = canvas.getContext("2d");
  // No 2D context (or no canvas): the CSS gradient + star fallback behind the
  // canvas stays visible, so the journey still renders. Nothing to animate.
  if (!context) {
    return { render: () => {}, destroy: () => {} };
  }
  const ctx = context;

  const q = quality();
  const STARS = ALL_STARS.slice(0, q.stars);
  const BLOBS = ALL_BLOBS.slice(0, q.blobs);
  const GALAXIES = ALL_GALAXIES.slice(0, q.galaxies);
  const ARM_STARS = ALL_ARM_STARS.slice(0, q.arms);

  let cw = 0;
  let ch = 0;

  function resize() {
    const d = Math.min(window.devicePixelRatio || 1, q.dprCap);
    cw = canvas.clientWidth;
    ch = canvas.clientHeight;
    canvas.width = Math.round(cw * d);
    canvas.height = Math.round(ch * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  function label(
    txt: string,
    x: number,
    y: number,
    alpha: number,
    color = "#E8E4DC",
    align: CanvasTextAlign = "left",
  ) {
    if (alpha < 0.02) return;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(txt, x, y);
    ctx.globalAlpha = 1;
  }

  function render(progress: number, t: number) {
    // Hidden tab: skip all drawing work. The last frame stays on screen.
    if (document.hidden) return;
    const e = exponentAt(progress);
    const W = 10 ** e;
    const S = Math.min(cw, ch);
    const ppm = S / W;
    // The local system (Sun, planets, Earth, Moon) fades out as the zoom leaves
    // for the galaxy; past e ~17.5 none of it should remain on screen.
    const localFade = 1 - smooth(15, 17.5, e);

    const a = 0.08 - 0.3 * smooth(3, 7, e);
    let camy = Math.max(0, RE + a * W) * (1 - smooth(6.5, 7.2, e));
    const mO = smooth(8, 9.2, e) * (1 - smooth(9.2, 10.4, e));
    const t1 = smooth(9.6, 11.3, e);
    const t2 = smooth(11.3, 13.05, e);
    const camx = AU * (1 - 0.5 * t1 - 0.5 * t2) + 1.6e8 * mO;
    camy += 6e7 * mO - 0.08 * W * smooth(6.8, 7.4, e);

    const project = (wx: number, wy: number): [number, number] => [
      cw / 2 + (wx - camx) * ppm,
      ch / 2 - (wy - camy) * ppm,
    ];

    const [sx, sy] = project(0, 0);
    const [ex, ey] = project(AU, 0);
    const [yx, yy] = project(AU, RE);
    const Rpx = RE * ppm;

    ctx.fillStyle = "#05060A";
    ctx.fillRect(0, 0, cw, ch);
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.textBaseline = "alphabetic";

    // Star field. Density and warmth rise as the void opens up.
    const zf = clamp(1 + (7 - e) * 0.012, 0.9, 1.08);
    const sa = 0.55 + 0.45 * smooth(3, 5.5, e);
    for (const s of STARS) {
      const al = s.a * sa * (0.75 + 0.25 * Math.sin(t * s.sp + s.ph));
      ctx.globalAlpha = al;
      ctx.fillStyle = s.w ? "#F3C99A" : "#E8E4DC";
      ctx.fillRect(cw / 2 + (s.x - 0.5) * cw * zf, ch / 2 + (s.y - 0.5) * ch * zf, s.s, s.s);
    }
    ctx.globalAlpha = 1;

    // Milky Way: a barred spiral seen at a tilt, the way a real galaxy photo
    // reads: a warm core, arms drawn as bands of stars (not wire), dark dust
    // lanes on the inner edge of each arm. It materialises as the zoom leaves the
    // Sun behind (e ~18), swells to fill the frame, then recedes into the
    // deep-field of galaxies.
    const gwA = smooth(17.5, 20, e) * (1 - smooth(24.5, 27, e));
    if (gwA > 0.01) {
      const R = 1.2e21 * ppm * 0.55;
      const gx = cw / 2;
      const gy = ch / 2;
      const tilt = 0.34 + 0.33 * smooth(20, 24, e);
      const spin = (t * 0.02) % TAU;

      ctx.save();
      ctx.globalAlpha = gwA;
      ctx.translate(gx, gy);
      ctx.rotate(spin);

      // Outer halo: a soft ellipse of faint light under everything.
      const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(R, 24));
      halo.addColorStop(0, "rgba(210,215,240,0.16)");
      halo.addColorStop(0.55, "rgba(180,195,235,0.06)");
      halo.addColorStop(1, "rgba(180,195,235,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(R, 24), Math.max(R * tilt, 16), 0, 0, TAU);
      ctx.fill();

      // Arms: two main + two minor, each a band of stars along a log spiral.
      const armStars = ARM_STARS;
      for (const st of armStars) {
        const major = st.arm < 2;
        const base = (st.arm / ARM_COUNT) * TAU;
        const reach = major ? R : R * 0.72;
        const twist = major ? 3.4 : 3.0;
        const r = st.u * reach;
        const ang = base + st.u * twist + (st.ang - 0.5) * 0.18;
        const spread = st.spread * (0.06 + st.u * 0.14) * reach;
        const x = Math.cos(ang) * r + spread * Math.cos(ang + Math.PI / 2);
        const y = (Math.sin(ang) * r + spread * Math.sin(ang + Math.PI / 2)) * tilt;
        ctx.globalAlpha = gwA * st.bright * (major ? 1 : 0.7);
        ctx.fillStyle = st.warm ? "rgba(255,235,205,0.95)" : "rgba(224,228,245,0.9)";
        ctx.fillRect(x, y, st.size, st.size);
      }
      ctx.globalAlpha = gwA;

      // Dust lanes: dark bands along the inner edge of each main arm.
      for (let arm = 0; arm < 2; arm++) {
        const base = (arm / 2) * TAU;
        ctx.beginPath();
        for (let i = 0; i <= 48; i++) {
          const u = i / 48;
          const r = u * R * 0.92;
          const ang = base + u * 3.4 - 0.22;
          const x = Math.cos(ang) * r;
          const y = Math.sin(ang) * r * tilt;
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.strokeStyle = "rgba(5,6,10,0.5)";
        ctx.lineWidth = Math.max(1.4, R * 0.05);
        ctx.stroke();
      }

      // Core: a bright warm bulge over the arm roots.
      const bulgeR = Math.max(R * 0.34, 22);
      const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, bulgeR);
      bg.addColorStop(0, "rgba(255,244,224,0.95)");
      bg.addColorStop(0.3, "rgba(255,214,150,0.6)");
      bg.addColorStop(0.7, "rgba(232,161,91,0.22)");
      bg.addColorStop(1, "rgba(232,161,91,0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(0, 0, bulgeR, bulgeR * (tilt + 0.2), 0, 0, TAU);
      ctx.fill();

      ctx.restore();
    }

    // Observable universe: the deep field. A dense scatter of distant galaxies
    // (sharp points plus faint smudges) with a light clustering, so it reads as
    // the cosmic web rather than a thin sprinkle of dots.
    const unA = smooth(23.5, 26.5, e);
    if (unA > 0.01) {
      ctx.save();
      ctx.globalAlpha = unA;
      for (const gl of GALAXIES) {
        // Cluster: pull points toward a few gentle sinusoid bands.
        const cx = gl.x + 0.04 * Math.sin(gl.y * 9 + 1.3);
        const cy = gl.y + 0.04 * Math.cos(gl.x * 7 + 0.4);
        const x = cw / 2 + (cx - 0.5) * cw * 1.2;
        const y = ch / 2 + (cy - 0.5) * ch * 1.2;
        if (gl.smudge) {
          const g = ctx.createRadialGradient(x, y, 0, x, y, gl.r * 3);
          g.addColorStop(0, gl.tint);
          g.addColorStop(1, "rgba(210,205,235,0)");
          ctx.globalAlpha = unA * gl.a;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(x, y, gl.r * 1.6, gl.r, 0.6, 0, TAU);
          ctx.fill();
        } else {
          ctx.globalAlpha = unA * gl.a;
          ctx.fillStyle = gl.tint;
          ctx.beginPath();
          ctx.arc(x, y, gl.r, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    const skyA = (1 - smooth(2, 5.5, e)) * 0.3;
    if (skyA > 0.003) {
      const g = ctx.createLinearGradient(0, yy - 0.5 * S, 0, yy);
      g.addColorStop(0, "rgba(40,70,130,0)");
      g.addColorStop(1, `rgba(70,110,190,${skyA})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, yy - 0.5 * S, cw, 0.5 * S);
    }

    // Sun.
    const sunA = smooth(10, 10.8, e) * localFade;
    if (sunA > 0.01) {
      const rc = Math.max(RS * ppm, 1.8);
      const rg = rc * 3.5 + 14;
      ctx.save();
      ctx.globalAlpha = sunA;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rg);
      g.addColorStop(0, "rgba(255,241,218,1)");
      g.addColorStop(0.18, "rgba(232,161,91,0.85)");
      g.addColorStop(1, "rgba(232,161,91,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, rg, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#FFF1DA";
      ctx.beginPath();
      ctx.arc(sx, sy, rc, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Orbit rings and planets.
    const orbA = 0.11 * smooth(11, 12, e) * localFade;
    if (orbA > 0.004) {
      ctx.strokeStyle = `rgba(232,228,220,${orbA})`;
      ctx.lineWidth = 1;
      for (const r of ORBITS) {
        const rp = r * ppm;
        if (rp < 4 || rp > 8000) continue;
        ctx.beginPath();
        ctx.arc(sx, sy, rp, 0, TAU);
        ctx.stroke();
      }
    }
    const plA = smooth(11.6, 12.4, e) * localFade;
    if (plA > 0.01) {
      for (const pl of PLANETS) {
        const q = project(pl.a * Math.cos(pl.ang), pl.a * Math.sin(pl.ang));
        ctx.globalAlpha = plA * 0.9;
        ctx.fillStyle = "#CFCBC2";
        ctx.beginPath();
        ctx.arc(q[0], q[1], Math.max(pl.r * ppm, 1.3), 0, TAU);
        ctx.fill();
        if (pl.lab) label(pl.n, q[0] + 7, q[1] - 7, plA * 0.8, "#9A9CA6");
      }
      ctx.globalAlpha = 1;
    }

    // Sun to Earth light line, with a travelling pulse.
    const lnA = smooth(10.3, 11, e) * (1 - smooth(12.3, 13, e)) * localFade;
    if (lnA > 0.01) {
      ctx.save();
      ctx.strokeStyle = `rgba(232,161,91,${0.4 * lnA})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.restore();
      const f = (t * 0.16) % 1;
      ctx.save();
      ctx.globalAlpha = lnA;
      ctx.shadowColor = "#E8A15B";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#FFE7C2";
      ctx.beginPath();
      ctx.arc(lerp(sx, ex, f), lerp(sy, ey, f), 2.4, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Moon.
    const mA = smooth(8, 8.6, e) * (1 - smooth(10, 10.8, e)) * localFade;
    if (mA > 0.01) {
      const mp = project(AU + LM * Math.cos(0.35), LM * Math.sin(0.35));
      const mr = LM * ppm;
      if (mr < 20000) {
        ctx.strokeStyle = `rgba(232,228,220,${0.14 * mA})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ex, ey, mr, 0, TAU);
        ctx.stroke();
      }
      ctx.save();
      ctx.strokeStyle = `rgba(232,228,220,${0.28 * mA})`;
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(mp[0], mp[1]);
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = mA;
      ctx.fillStyle = "#CFCBC2";
      ctx.beginPath();
      ctx.arc(mp[0], mp[1], Math.max(RM * ppm, 1.7), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Earth: a disc while small, the horizon filling the frame while large. It
    // fades with the rest of the local system once the zoom leaves for the galaxy.
    if (Rpx < 1.6) {
      ctx.globalAlpha = localFade;
      ctx.fillStyle = "#8FB0E8";
      ctx.beginPath();
      ctx.arc(ex, ey, 1.6, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (Rpx < 2000) {
      const g = ctx.createLinearGradient(0, ey - Rpx, 0, ey + Rpx);
      g.addColorStop(0, "#14213a");
      g.addColorStop(1, "#05070d");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ex, ey, Rpx, 0, TAU);
      ctx.fill();

      // Surface detail: continents and cloud banks clipped to the disc, plus a
      // faint latitude/longitude graticule, so Earth reads as a world and not a
      // plain blue dot. Only drawn once the disc is big enough to show it.
      if (Rpx > 60) {
        const f = clamp((2000 - Rpx) / 1200);
        ctx.save();
        ctx.beginPath();
        ctx.arc(ex, ey, Rpx, 0, TAU);
        ctx.clip();
        ctx.globalAlpha = f;
        for (const b of BLOBS) {
          ctx.fillStyle = b.c;
          ctx.beginPath();
          ctx.ellipse(ex + b.x * Rpx, ey + b.y * Rpx, b.rx * Rpx, b.ry * Rpx, b.rot, 0, TAU);
          ctx.fill();
        }
        ctx.strokeStyle = "rgba(180,205,255,0.08)";
        ctx.lineWidth = 1;
        for (let l = -60; l <= 60; l += 30) {
          const rad = (l * Math.PI) / 180;
          const rx = Rpx * Math.cos(rad);
          ctx.beginPath();
          ctx.ellipse(ex, ey - Rpx * Math.sin(rad), rx, rx * 0.22, 0, 0, Math.PI);
          ctx.stroke();
        }
        for (let m = 0; m < 6; m++) {
          ctx.beginPath();
          ctx.ellipse(ex, ey, Rpx * Math.abs(Math.cos((m * Math.PI) / 6)), Rpx, 0, 0, TAU);
          ctx.stroke();
        }
        // Terminator: the day/night falloff across the sphere.
        const tg = ctx.createLinearGradient(ex - Rpx, 0, ex + Rpx, 0);
        tg.addColorStop(0, "rgba(5,6,10,0)");
        tg.addColorStop(0.45, "rgba(5,6,10,0.15)");
        tg.addColorStop(1, "rgba(5,6,10,0.88)");
        ctx.fillStyle = tg;
        ctx.fillRect(ex - Rpx, ey - Rpx, 2 * Rpx, 2 * Rpx);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      ctx.shadowColor = "rgba(120,165,240,0.6)";
      ctx.shadowBlur = Math.min(18, 6 + Rpx * 0.02);
      ctx.strokeStyle = "rgba(150,185,245,0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ex, ey, Rpx, 0, TAU);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      const n = 64;
      const topPath = () => {
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const x = -20 + (cw + 40) * (i / n);
          const dx = x - ex;
          const y = yy + (dx * dx) / (Rpx + Math.sqrt(Math.max(0, Rpx * Rpx - dx * dx)));
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
      };
      const g = ctx.createLinearGradient(0, yy, 0, yy + 0.6 * S);
      g.addColorStop(0, "#14213a");
      g.addColorStop(1, "#05070d");
      topPath();
      ctx.lineTo(cw + 20, ch + 40);
      ctx.lineTo(-20, ch + 40);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(150,185,245,0.55)";
      ctx.lineWidth = 1.2;
      topPath();
      ctx.stroke();
    }

    // "You are here" pulse: the only accent in the scene, one focal point.
    const k = smooth(7.4, 8.4, e);
    const ph = (t * 0.45) % 1;
    if (k < 0.98) {
      ctx.save();
      ctx.globalAlpha = 1 - k;
      ctx.shadowColor = "#E8A15B";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#E8A15B";
      ctx.beginPath();
      ctx.arc(yx, yy, 3, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(232,161,91,${0.5 * (1 - ph)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(yx, yy, 3 + ph * 16, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    if (k > 0.02) {
      ctx.save();
      ctx.globalAlpha = k;
      ctx.strokeStyle = "#E8A15B";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ex, ey, 8, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(232,161,91,${0.45 * (1 - ph)})`;
      ctx.beginPath();
      ctx.arc(ex, ey, 8 + ph * 18, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  resize();
  const onResize = () => {
    resize();
    render(0, 0);
  };
  window.addEventListener("resize", onResize);

  return {
    render,
    destroy: () => window.removeEventListener("resize", onResize),
  };
}
