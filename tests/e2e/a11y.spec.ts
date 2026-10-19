import { test, expect } from "@playwright/test";

test("journey has an accessible heading and progress bar", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /You are here/i })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: /progress/i })).toBeVisible();
});

test("content survives with WebGL disabled", async ({ page }) => {
  await page.addInitScript(() => {
    // Force canvas context creation to fail: the CSS star fallback must carry.
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /You are here/i })).toBeVisible();
});
