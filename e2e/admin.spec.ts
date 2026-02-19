import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./auth";

test.describe("Admin area", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("redirects non-admin user to home", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
  });
});
