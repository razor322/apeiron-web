import { test, expect } from "@playwright/test";

test("journey reaches all stages on scroll", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /You are here/i })).toBeVisible();
  await page.mouse.wheel(0, 6000);
  await page.mouse.wheel(0, 6000);
  await page.mouse.wheel(0, 6000);
  await expect(page.getByText(/observable universe/i).first()).toBeVisible();
});

test("reduced motion completes the journey without pinning", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(page.getByText(/you are here/i).first()).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByText(/you are part of the universe/i).first()).toBeVisible();
});
