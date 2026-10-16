import type { Locale } from "@/i18n/config";

const WORDS: Record<Locale, {
  million: string;
  billion: string;
  ltSecond: string;
  seconds: string;
  minutes: string;
  hours: string;
  years: string;
}> = {
  en: {
    million: "million km",
    billion: "billion km",
    ltSecond: "less than a second",
    seconds: "seconds",
    minutes: "minutes",
    hours: "hours",
    years: "years",
  },
  id: {
    million: "juta km",
    billion: "miliar km",
    ltSecond: "kurang dari 1 detik",
    seconds: "detik",
    minutes: "menit",
    hours: "jam",
    years: "tahun",
  },
};

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
  return `${f.format(sig(meters / 1e12))} ${w.billion}`;
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

export function exponentForMeters(meters: number): number {
  if (meters <= 0) return 0;
  return Math.floor(Math.log10(meters));
}
