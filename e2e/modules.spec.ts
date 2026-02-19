import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./auth";

test.describe("Modules page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("loads and shows module list", async ({ page }) => {
    await page.goto("/modules");
    await expect(page.getByRole("heading", { name: /Learning Modules/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("link", { name: /Tafseer/i })).toBeVisible({ timeout: 10000 });
  });

  test("navigates to module detail when clicking a module", async ({ page }) => {
    await page.goto("/modules");
    await Promise.all([
      page.waitForURL(/\/modules\/tafseer/, { timeout: 10000 }),
      page.getByRole("link", { name: /Tafseer/i }).first().click(),
    ]);
    await expect(page).toHaveURL(/\/modules\/tafseer/);
  });
});
