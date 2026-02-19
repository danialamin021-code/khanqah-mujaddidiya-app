import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./auth";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("loads and shows main sections", async ({ page }) => {
    await page.goto("/home");
    const hasIntroduction = await page.locator("h2", { hasText: "Introduction" }).isVisible();
    const hasLearningModules = await page.locator("h2", { hasText: "Learning Modules" }).isVisible();
    const hasAdminDashboard = await page.locator("h1, h2", { hasText: /Admin Dashboard/i }).isVisible();
    expect(hasIntroduction || hasLearningModules || hasAdminDashboard).toBe(true);
  });

  test("navigates to modules", async ({ page }) => {
    await page.goto("/home");
    await Promise.all([
      page.waitForURL(/\/modules/, { timeout: 10000 }),
      page.getByRole("link", { name: /View all modules|Learning Modules/ }).first().click(),
    ]);
  });
});
