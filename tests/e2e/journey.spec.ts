import { test, expect } from "@playwright/test";

test("journey reaches all stages and progress navigates", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /You are here/i })).toBeVisible();
  const nav = page.getByRole("navigation", { name: /stage/i });
  await nav.getByRole("button", { name: /Observable Universe/i }).click();
  await expect(page.getByText(/observable universe/i).first()).toBeVisible();
});

test("reduced motion completes the journey without pinning", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(page.getByText(/you are here/i).first()).toBeVisible();
  await page.getByRole("button", { name: /End of journey/i }).scrollIntoViewIfNeeded();
  await expect(page.getByText(/you are part of the universe/i).first()).toBeVisible();
});
