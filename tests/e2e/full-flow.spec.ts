import { test, expect } from "@playwright/test";

test("hero to explore to about to cosmos today", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /You are here/i })).toBeVisible();

  await page.getByRole("navigation", { name: /Main navigation/i })
    .getByRole("link", { name: /Explore/i })
    .click();
  await expect(page.getByRole("heading", { level: 1, name: /Explore/i })).toBeVisible();

  await page.getByRole("navigation", { name: /Main navigation/i })
    .getByRole("link", { name: /About/i })
    .click();
  await expect(page.getByRole("heading", { level: 1, name: /About/i })).toBeVisible();

  await page.goto("/en/cosmos-today");
  await expect(page.getByRole("main")).toBeVisible();
});
