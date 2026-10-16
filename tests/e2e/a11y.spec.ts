import { test, expect } from "@playwright/test";

test("keyboard-only can reach and activate progress nav", async ({ page }) => {
  await page.goto("/en");
  const earth = page.getByRole("button", { name: /Earth/i });
  // Reach the Earth stage by Tab only: it must be genuinely keyboard-reachable,
  // not merely focusable programmatically.
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    if (await earth.evaluate((el) => el === document.activeElement)) break;
  }
  await expect(earth).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(earth).toHaveAttribute("aria-current", "step");
});

test("content survives with WebGL disabled", async ({ page }) => {
  await page.addInitScript(() => {
    // Force canvas context creation to fail: the CSS star fallback must carry.
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /You are here/i })).toBeVisible();
});
