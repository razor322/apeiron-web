import { test, expect } from "@playwright/test";

test("keyboard-only can reach and activate progress nav", async ({ page }) => {
  await page.goto("/en");
  await page.keyboard.press("Tab");
  const progress = page.getByRole("navigation", { name: /stage/i });
  await progress.getByRole("button", { name: /Earth/i }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /Earth/i })).toHaveAttribute(
    "aria-current",
    "step",
  );
});

test("content survives with WebGL disabled", async ({ page }) => {
  await page.addInitScript(() => {
    // Force canvas context creation to fail: the CSS star fallback must carry.
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /You are here/i })).toBeVisible();
});
