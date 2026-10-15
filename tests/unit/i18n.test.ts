import { describe, it, expect } from "vitest";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/config";
import { en } from "@/i18n/en";
import { id } from "@/i18n/id";

describe("i18n", () => {
  it("has en and id with en as default", () => {
    expect(LOCALES).toEqual(["en", "id"]);
    expect(DEFAULT_LOCALE).toBe("en");
  });
  it("id dictionary has the same keys as en", () => {
    const deepKeys = (o: object, p = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === "object" && !Array.isArray(v)
          ? deepKeys(v, `${p}${k}.`)
          : [`${p}${k}`],
      );
    expect(deepKeys(id).sort()).toEqual(deepKeys(en).sort());
  });
  it("no dictionary value contains an em dash", () => {
    for (const dict of [en, id]) {
      expect(JSON.stringify(dict)).not.toContain("\u2014");
    }
  });
});
