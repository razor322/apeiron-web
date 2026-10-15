export const LOCALES = ["en", "id"] as const;

export const DEFAULT_LOCALE = "en";

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
