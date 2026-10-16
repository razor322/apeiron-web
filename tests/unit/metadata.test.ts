import { describe, it, expect } from "vitest";
import { generateMetadata as homeMeta } from "@/app/[locale]/page";
import { generateMetadata as exploreMeta } from "@/app/[locale]/explore/page";
import { generateMetadata as topicMeta } from "@/app/[locale]/explore/[slug]/page";
import { generateMetadata as cosmosMeta } from "@/app/[locale]/cosmos-today/page";
import { generateMetadata as aboutMeta } from "@/app/[locale]/about/page";
import { alternates } from "@/lib/seo";

describe("metadata", () => {
  it("home exposes per-locale title, description, and language alternates", async () => {
    const m = await homeMeta({ params: Promise.resolve({ locale: "en" }) });
    expect(m.title).toBeTruthy();
    expect(m.description).toBeTruthy();
    expect(m.alternates?.languages).toHaveProperty("id");
    expect(m.openGraph?.title).toBeTruthy();
  });

  it("home id locale differs from en", async () => {
    const en = await homeMeta({ params: Promise.resolve({ locale: "en" }) });
    const id = await homeMeta({ params: Promise.resolve({ locale: "id" }) });
    expect(id.title).not.toBe(en.title);
    expect(id.description).not.toBe(en.description);
    expect(id.alternates?.languages).toHaveProperty("id");
  });

  it("every route returns title, description, openGraph, and en/id alternates", async () => {
    const routes: Array<(a: { params: Promise<{ locale: string }> }) => Promise<unknown>> = [
      homeMeta,
      exploreMeta,
      cosmosMeta,
      aboutMeta,
    ];
    for (const fn of routes) {
      const m = (await fn({ params: Promise.resolve({ locale: "en" }) })) as {
        title?: unknown;
        description?: unknown;
        openGraph?: { title?: unknown };
        alternates?: { languages?: Record<string, string> };
      };
      expect(m.title).toBeTruthy();
      expect(m.description).toBeTruthy();
      expect(m.openGraph?.title).toBeTruthy();
      const langs = Object.keys(m.alternates?.languages ?? {});
      expect(langs).toContain("en");
      expect(langs).toContain("id");
    }
  });

  it("topic route exposes per-category title with en/id alternates", async () => {
    const m = await topicMeta({ params: Promise.resolve({ locale: "en", slug: "planet" }) });
    expect(m.title).toBeTruthy();
    expect(m.description).toBeTruthy();
    expect(m.alternates?.languages).toHaveProperty("id");
  });

  it("alternates point at /en and /id paths", () => {
    const langs = alternates();
    expect(langs.en).toBe("/en");
    expect(langs.id).toBe("/id");
    expect(langs["x-default"]).toBe("/en");
    expect(alternates("explore").en).toBe("/en/explore");
  });
});
