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

// Adaptive quality: weak devices (<=4 cores) and narrow viewports draw fewer
// stars at lower device pixel ratio. One factor, one place to tune it.
function quality(): { dprCap: number; stars: number } {
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : undefined;
  const weak = typeof cores === "number" && cores <= 4;
  const narrow = typeof window !== "undefined" && window.innerWidth < 768;
  if (weak || narrow) return { dprCap: 1, stars: 240 };
  return { dprCap: 2, stars: ALL_STARS.length };
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

    // Milky Way: a barred spiral seen at a tilt. It materialises as the zoom
    // leaves the Sun behind (e ~18), swells to fill the frame, then recedes into
    // the deep-field of galaxies. Drawn before the sky glow so the horizon never
    // competes with it, and it is absent at small e.
    const gwA = smooth(17.5, 20, e) * (1 - smooth(24.5, 27, e));
    if (gwA > 0.01) {
      const R = Math.max(1.2e21, 1e21) * ppm * 0.5;
      const gx = cw / 2;
      const gy = ch / 2;
      const tilt = 0.32 + 0.35 * smooth(20, 24, e);
      const spin = (t * 0.02) % TAU;

      ctx.save();
      ctx.globalAlpha = gwA;
      ctx.translate(gx, gy);
      ctx.rotate(spin);

      // Central bulge: warm haze.
      const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(R * 0.5, 30));
      bg.addColorStop(0, "rgba(255,236,201,0.9)");
      bg.addColorStop(0.35, "rgba(232,161,91,0.35)");
      bg.addColorStop(1, "rgba(232,161,91,0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(R * 0.5, 30), Math.max(R * 0.5 * tilt, 12), 0, 0, TAU);
      ctx.fill();

      // Spiral arms: a few logarithmic arcs of stars.
      const arms = 2;
      for (let arm = 0; arm < arms; arm++) {
        const base = (arm / arms) * TAU;
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const u = i / 60;
          const r = u * R;
          const ang = base + u * 3.2;
          const x = Math.cos(ang) * r;
          const y = Math.sin(ang) * r * tilt;
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.strokeStyle = "rgba(232,228,220,0.28)";
        ctx.lineWidth = Math.max(1, R * 0.02);
        ctx.stroke();
      }

      // Star dust across the disc.
      const dust = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(R, 20));
      dust.addColorStop(0, "rgba(220,225,240,0.18)");
      dust.addColorStop(0.6, "rgba(180,195,235,0.08)");
      dust.addColorStop(1, "rgba(180,195,235,0)");
      ctx.fillStyle = dust;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.max(R, 20), Math.max(R * tilt, 14), 0, 0, TAU);
      ctx.fill();

      ctx.restore();
    }

    // Observable universe: the deep field. A scatter of distant galaxies that
    // grows as the Milky Way recedes, using the same seeded field so it is stable.
    const unA = smooth(24, 26.5, e);
    if (unA > 0.01) {
      ctx.save();
      ctx.globalAlpha = unA;
      for (const s of STARS) {
        if (s.s < 1.4) continue;
        const x = cw / 2 + (s.x - 0.5) * cw * 1.15;
        const y = ch / 2 + (s.y - 0.5) * ch * 1.15;
        const r = 1.2 + s.a * 1.8;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, "rgba(255,244,222,0.9)");
        g.addColorStop(0.4, "rgba(210,205,235,0.25)");
        g.addColorStop(1, "rgba(210,205,235,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, TAU);
        ctx.fill();
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
      ctx.strokeStyle = "rgba(150,185,245,0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ex, ey, Rpx, 0, TAU);
      ctx.stroke();
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
