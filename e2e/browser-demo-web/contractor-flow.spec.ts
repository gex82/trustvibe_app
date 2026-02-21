import { expect, test } from "@playwright/test";
import { contractorCreds, goToTab, loginAs } from "./helpers/session";

test("contractor flow: demo-web core path", async ({ page }) => {
  await loginAs(page, "contractor", contractorCreds.email, contractorCreds.password);

  await expect(page.getByTestId("tab-home")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByTestId("tab-earnings")).toBeVisible();
  await expect(page.getByTestId("tab-messages")).toBeVisible();

  await goToTab(page, "tab-earnings");
  await expect(page).toHaveURL(/\/earnings/);

  // Legacy selector alias should still be available during transition.
  await goToTab(page, "tab-profile");
  await expect(page).toHaveURL(/\/earnings/);

  await goToTab(page, "tab-messages");
  await expect(page.getByTestId("messages-input")).toBeVisible();
  await page.getByTestId("messages-input").fill("Demo-web contractor ping.");
  await page.getByTestId("messages-send").click();

  await goToTab(page, "tab-home");
  await page.getByTestId("home-profile-link").click();
  await page.getByTestId("profile-edit").click();
  await expect(page.getByTestId("edit-profile-upload-avatar")).toBeVisible();

  await goToTab(page, "tab-home");
  await page.getByTestId("home-profile-link").click();
  await page.getByTestId("profile-documents").click();
  await expect(page.getByTestId("documents-upload")).toBeVisible();

  await goToTab(page, "tab-home");
  await page.getByTestId("home-profile-link").click();
  await page.getByTestId("profile-logout").click();
  await expect(page.getByTestId("role-select-customer")).toBeVisible();
});
