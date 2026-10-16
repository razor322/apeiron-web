import { test, expect } from "@playwright/test";

// Visual-fidelity checks for the prototype port: giant editorial figure, the
// live scale readout, ruler landmarks, and the collapsed source disclosure.
test("content stage shows the giant figure and collapsed sources", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText("12,756 km")).toBeVisible();
  const details = page.locator("details");
  expect(await details.count()).toBeGreaterThan(0);
  await expect(page.getByText(/Source and numbers/i).first()).toBeVisible();
});

test("ruler landmarks and live readout render", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText(/Screen width/i)).toBeVisible();
  await expect(page.getByText(/Moon's orbit/i)).toBeVisible();
});
