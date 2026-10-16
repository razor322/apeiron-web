import type { Locale } from "@/i18n/config";

const WORDS: Record<Locale, {
  million: string;
  billion: string;
  ly: string;
  ltSecond: string;
  seconds: string;
  minutes: string;
  hours: string;
  years: string;
  days: string;
}> = {
  en: {
    million: "million km",
    billion: "billion km",
    ly: "light-years",
    ltSecond: "less than a second",
    seconds: "seconds",
    minutes: "minutes",
    hours: "hours",
    years: "years",
    days: "days",
  },
  id: {
    million: "juta km",
    billion: "miliar km",
    ly: "tahun cahaya",
    ltSecond: "kurang dari 1 detik",
    seconds: "detik",
    minutes: "menit",
    hours: "jam",
    years: "tahun",
    days: "hari",
  },
};

// One light-year in metres, for scales once kilometres stop meaning anything.
const LIGHT_YEAR = 9.4607e15;

function nf(locale: Locale): Intl.NumberFormat {
  return new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
    maximumFractionDigits: 1,
  });
}

// ponytail: brief asked for 2 sig figs (sig2), but sig2 rounds 384400 km to 380000,
// failing the brief's own expected "384,000 km". 3 sig figs reproduces every stated
// expectation. Revert to sig2 only if the expected strings change.
function sig(x: number): number {
  if (x === 0) return 0;
  const m = 10 ** (Math.floor(Math.log10(Math.abs(x))) - 2);
  return Math.round(x / m) * m;
}

export function formatLength(meters: number, locale: Locale = "en"): string {
  const w = WORDS[locale];
  const f = nf(locale);
  if (meters < 1000) return `${f.format(sig(meters))} m`;
  const km = sig(meters / 1e3);
  if (km < 1e6) return `${f.format(km)} km`;
  const million = sig(meters / 1e9);
  if (million < 1e3) return `${f.format(million)} ${w.million}`;
  if (meters < LIGHT_YEAR * 0.1) return `${f.format(sig(meters / 1e12))} ${w.billion}`;
  return `${f.format(sig(meters / LIGHT_YEAR))} ${w.ly}`;
}

export function formatDuration(seconds: number, locale: Locale = "en"): string {
  const w = WORDS[locale];
  const f = nf(locale);
  if (seconds < 1) return w.ltSecond;
  if (seconds < 60) return `${f.format(seconds)} ${w.seconds}`;
  if (seconds < 3600) return `${f.format(seconds / 60)} ${w.minutes}`;
  if (seconds < 31557600) return `${f.format(seconds / 3600)} ${w.hours}`;
  return `${f.format(seconds / 31557600)} ${w.years}`;
}

// Orbital mechanics period: days below ~1000 (Mercury 88d .. Mars 687d), else years
// (Jupiter 11.9y onward). formatDuration is tuned for light-travel times and would
// report Mercury as "2,112 hours".
export function formatPeriod(seconds: number, locale: Locale = "en"): string {
  const w = WORDS[locale];
  const f = nf(locale);
  const days = seconds / 86400;
  // ponytail: days branch skips sig() — rounding 3 sig figs turned 687 into "690 days";
  // day counts are small and exact, sig only earns its keep on scaled years.
  if (days < 1000) return `${f.format(days)} ${w.days}`;
  return `${f.format(sig(seconds / 31557600))} ${w.years}`;
}

export function exponentForMeters(meters: number): number {
  if (meters <= 0) return 0;
  return Math.floor(Math.log10(meters));
}
