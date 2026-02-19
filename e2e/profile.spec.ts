import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./auth";

test.describe("Profile page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("loads and shows profile sections", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: /Profile/i })).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: /Account|Roles/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("has link to settings", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("link", { name: /Settings/i })).toBeVisible();
  });
});
