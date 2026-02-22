import { expect, test } from "@playwright/test";
import { adminCreds, loginAs } from "./helpers/session";

test("admin flow: core navigation and tables", async ({ page }) => {
  await loginAs(page, "admin", adminCreds.email, adminCreds.password);

  await expect(page.getByTestId("admin-nav-users")).toBeVisible({ timeout: 45_000 });

  await page.getByTestId("admin-nav-users").click({ force: true });
  await expect(page.getByTestId("users-table")).toBeVisible();

  await page.goBack();
  await page.getByTestId("admin-nav-cases").click({ force: true });
  await expect(page.getByTestId("cases-table")).toBeVisible();
  await expect(page.getByTestId("cases-card-list")).toBeVisible();

  await page.goBack();
  await page.getByTestId("admin-nav-config").click({ force: true });
  await expect(page.getByTestId("config-save")).toBeVisible();
});
