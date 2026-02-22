import { expect, test, type Page } from "@playwright/test";
import { adminCreds, contractorCreds, customerCreds, goToTab, loginAs } from "./helpers/session";

async function expectNoBlockedTokens(page: Page, blockedTokens: string[]): Promise<void> {
  const body = page.locator("body");
  for (const token of blockedTokens) {
    await expect(body).not.toContainText(token);
  }
}

test("localization parity: customer flow in ES mode blocks English copy", async ({ page }) => {
  await loginAs(page, "customer", customerCreds.email, customerCreds.password, "es");

  await expect(page.locator("body")).toContainText("Buscar Contratistas", {
    timeout: 45_000,
  });
  await expectNoBlockedTokens(page, ["Log out", "Find Contractors", "Quick Actions"]);

  await goToTab(page, "tab-search");
  await expect(page.locator("body")).toContainText("Filtros");
  await expectNoBlockedTokens(page, ["Filters", "Clear filters"]);

  await page.getByTestId("search-filter-category-plumbing").click();
  await expect(page.locator("body")).toContainText("Limpiar filtros");
  await expectNoBlockedTokens(page, ["Clear filters"]);

  await goToTab(page, "tab-projects");
  const projectCard = page.locator('[data-testid^="projects-list-card-"]').first();
  await expect(projectCard).toBeVisible();
  await projectCard.click();
  await expect(page.getByTestId("project-detail-workflow-card")).toBeVisible();
  await expectNoBlockedTokens(page, ["Project Progress", "Description", "Photos", "Select contractor", "Developer actions"]);

  await goToTab(page, "tab-messages");
  await expect(page.getByTestId("messages-input")).toBeVisible();
  await expectNoBlockedTokens(page, ["Type a message..."]);

  await goToTab(page, "tab-home");
  await page.getByTestId("home-profile-link").click();
  await page.getByTestId("profile-documents").click();
  await expect(page.getByTestId("documents-upload")).toBeVisible();
  await expectNoBlockedTokens(page, ["Documents", "Upload Document"]);
});

test("localization parity: contractor flow in ES mode blocks English copy", async ({ page }) => {
  await loginAs(
    page,
    "contractor",
    contractorCreds.email,
    contractorCreds.password,
    "es"
  );

  await expect(page.locator("body")).toContainText("Resumen de Ganancias", {
    timeout: 45_000,
  });
  await expectNoBlockedTokens(page, ["Earnings Overview", "Browse all", "No active jobs right now"]);

  await goToTab(page, "tab-earnings");
  await expect(page.locator("body")).toContainText("Historial de Pagos");
  await expectNoBlockedTokens(page, ["Payment History", "Gross GMV", "Net Rate"]);

  await goToTab(page, "tab-messages");
  await expect(page.getByTestId("messages-input")).toBeVisible();
  await expectNoBlockedTokens(page, ["Type a message..."]);

  await goToTab(page, "tab-home");
  await page.getByTestId("home-profile-link").click();
  await page.getByTestId("profile-edit").click();
  await expect(page.getByTestId("edit-profile-upload-avatar")).toBeVisible();
  await expectNoBlockedTokens(page, ["Edit Profile", "Upload Avatar", "Save"]);

  await goToTab(page, "tab-home");
  await page.getByTestId("home-profile-link").click();
  await page.getByTestId("profile-documents").click();
  await expect(page.getByTestId("documents-upload")).toBeVisible();
  await expectNoBlockedTokens(page, ["Documents", "Upload Document"]);
});

test("localization parity: admin flow in ES mode blocks English copy", async ({ page }) => {
  await loginAs(page, "admin", adminCreds.email, adminCreds.password, "es");

  await expect(page.locator("body")).toContainText("Panel de Administración", {
    timeout: 45_000,
  });
  await expectNoBlockedTokens(page, ["Admin Panel", "Log out", "Switch Role", "Loading..."]);

  await page.getByTestId("admin-nav-users").click({ force: true });
  await expect(page.getByTestId("users-table")).toBeVisible();
  await expectNoBlockedTokens(page, ["Users", "Name", "Role", "Email"]);

  await page.goBack();
  await page.getByTestId("admin-nav-cases").click({ force: true });
  await expect(page.getByTestId("cases-card-list")).toBeVisible();
  await expectNoBlockedTokens(page, ["No cases found", "Case Summary", "Evidence on File"]);

  await page.goBack();
  await page.getByTestId("admin-nav-config").click({ force: true });
  await expect(page.getByTestId("config-save")).toBeVisible();
  await expectNoBlockedTokens(page, ["Feature Flags", "Save", "Saving..."]);
});
