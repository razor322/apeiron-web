import { test, expect } from "@playwright/test";

test("solar system 3D renders the scene, rail and info card", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/en/solar-system-3d", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /Solar System in 3D/i })).toBeVisible();

  // The rail lists every body as a button.
  await expect(page.getByRole("button", { name: /Saturn/i }).first()).toBeVisible();

  // Selecting a body opens the info card.
  await page.getByRole("button", { name: /Saturn/i }).first().click();
  await expect(page.getByText(/Pelajari lebih lanjut|Learn more/i).first()).toBeVisible();

  // The decorative canvas is present and labelled.
  await expect(page.locator("canvas").first()).toBeVisible();

  expect(errors, `console errors: ${errors.join(" | ")}`).toEqual([]);
});
