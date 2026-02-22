import { expect, test } from "@playwright/test";
import { customerCreds, openRoleSelect } from "./helpers/session";

test("fallback mode: mock toggle remains usable", async ({ page }) => {
  await openRoleSelect(page);

  await page.getByTestId("demo-mode-mock").click();
  await page.getByTestId("role-select-customer").click();

  await page.getByTestId("login-email-input").fill(customerCreds.email);
  await page.getByTestId("login-password-input").fill(customerCreds.password);
  await page.getByTestId("login-submit").click();

  await expect(page.getByTestId("home-language-container")).toBeVisible({
    timeout: 45_000,
  });
});
