import { expect, test } from "@playwright/test";
import {
  contractorCreds,
  customerCreds,
  goToTab,
  openRoleSelect,
} from "./helpers/session";

test("hire via escrow locks contractor and agreement renders contractor identity", async ({
  page,
}) => {
  await openRoleSelect(page);
  await page.getByTestId("demo-mode-mock").click();
  await page.getByTestId("role-select-customer").click();
  await page.getByTestId("login-email-input").fill(customerCreds.email);
  await page.getByTestId("login-password-input").fill(customerCreds.password);
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("home-language-container")).toBeVisible();

  await goToTab(page, "tab-search");
  await page.locator('[data-testid^="search-recommended-contractor-"]').first().click();
  await expect(page.getByTestId("contractor-profile-title")).toBeVisible();
  await page.getByTestId("contractor-profile-hire-via-escrow").click();

  await expect(page).toHaveURL(/\/projects\/new\?contractor=/);
  await expect(page.getByTestId("new-project-linked-contractor-card")).toBeVisible();

  await page.getByTestId("new-project-title").fill("Prelinked contractor flow");
  await page
    .getByTestId("new-project-description")
    .fill("Testing locked contractor project creation flow.");
  await page.getByTestId("new-project-submit").click();
  await expect(page.getByText(/Project Posted|Proyecto Publicado/)).toBeVisible();
  await page.getByRole("button", { name: /View All My Projects|Ver Todos Mis Proyectos/ }).click();

  await page.getByTestId("projects-list-card-proj-kitchen").click();
  await page
    .getByRole("button", {
      name: /Accept This Quote|Aceptar Esta Cotización/,
    })
    .click();
  const contractorLabel = page.getByTestId("agreement-review-contractor");
  await expect(contractorLabel).toBeVisible();
  await expect(contractorLabel).toContainText("Juan");
  await expect(contractorLabel).not.toContainText("user-juan");
});

test("utility screens show structured content for free exploration", async ({ page }) => {
  await openRoleSelect(page);
  await page.getByTestId("demo-mode-mock").click();
  await page.getByTestId("role-select-customer").click();
  await page.getByTestId("login-email-input").fill(customerCreds.email);
  await page.getByTestId("login-password-input").fill(customerCreds.password);
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("home-language-container")).toBeVisible();

  await page.getByTestId("home-profile-link").click();
  await page.getByTestId("profile-notifications").click();
  await expect(page.getByTestId("notification-item-escrow-funded")).toBeVisible();

  await page.goBack();
  await page.getByTestId("profile-payment-methods").click();
  await expect(page.getByTestId("payment-method-card")).toBeVisible();
  await expect(page.getByTestId("payment-method-add-preview")).toBeVisible();

  await page.goBack();
  await page.getByTestId("profile-settings").click();
  await expect(page.getByTestId("settings-language-card")).toBeVisible();

  await page.goBack();
  await page.getByTestId("profile-logout").click();
  await expect(page.getByTestId("role-select-customer")).toBeVisible();

  await page.getByTestId("demo-mode-mock").click();
  await page.getByTestId("role-select-contractor").click();
  await page.getByTestId("login-email-input").fill(contractorCreds.email);
  await page.getByTestId("login-password-input").fill(contractorCreds.password);
  await page.getByTestId("login-submit").click();
  await page.getByTestId("home-profile-link").click();
  await page.getByTestId("profile-availability").click();
  await expect(page.getByTestId("availability-day-mon")).toBeVisible();
  await page.getByTestId("availability-save").click();
  await expect(page.getByTestId("availability-save-banner")).toBeVisible();
});
