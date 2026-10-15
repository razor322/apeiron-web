import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { en } from "@/i18n/en";
import { id } from "@/i18n/id";

const dictionaries: Record<Locale, Dictionary> = { en, id };

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}
