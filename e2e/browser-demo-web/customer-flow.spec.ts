import { expect, test } from "@playwright/test";
import { customerCreds, goToTab, loginAs } from "./helpers/session";

test("customer flow: demo-web core path", async ({ page }) => {
  await loginAs(page, "customer", customerCreds.email, customerCreds.password);

  await expect(page.getByTestId("home-language-container")).toBeVisible({
    timeout: 45_000,
  });

  await page.getByTestId("home-language-es").click();
  await page.getByTestId("home-language-en").click();

  await goToTab(page, "tab-search");
  await expect(page.getByTestId("search-query-input")).toBeVisible();

  const contractorCard = page
    .locator('[data-testid^="search-recommended-contractor-"]')
    .first();
  await expect(contractorCard).toBeVisible();
  await contractorCard.click();
  await expect(page.getByTestId("contractor-profile-title")).toBeVisible();

  await goToTab(page, "tab-projects");
  const projectCard = page.locator('[data-testid^="projects-list-card-"]').first();
  await expect(projectCard).toBeVisible();
  await projectCard.click();
  await expect(page.getByTestId("project-detail-workflow-card")).toBeVisible();

  await goToTab(page, "tab-messages");
  await expect(page.getByTestId("messages-input")).toBeVisible();

  // Legacy selector alias should still route via the messages tab.
  await goToTab(page, "tab-profile");
  await expect(page.getByTestId("messages-input")).toBeVisible();

  await goToTab(page, "tab-home");
  await page.getByTestId("home-profile-link").click();
  await page.getByTestId("profile-documents").click();
  await expect(page.getByTestId("documents-upload")).toBeVisible();

  await goToTab(page, "tab-home");
  await page.getByTestId("home-quick-logout").click();
  await expect(page.getByTestId("role-select-customer")).toBeVisible();
});
