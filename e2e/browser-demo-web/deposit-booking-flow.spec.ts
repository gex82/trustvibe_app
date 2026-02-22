import { expect, test } from "@playwright/test";
import { customerCreds, goToTab, loginAs } from "./helpers/session";

test("customer flow: deposit confirm, capture, and booking gate", async ({ page }) => {
  await loginAs(page, "customer", customerCreds.email, customerCreds.password);

  await page.getByTestId("demo-mode-mock").click();

  await goToTab(page, "tab-projects");
  const projectCard = page.locator('[data-testid^="projects-list-card-"]').first();
  await expect(projectCard).toBeVisible({ timeout: 45_000 });
  await projectCard.click();

  await expect(page.getByTestId("project-detail-workflow-card")).toBeVisible();
  await page.getByTestId("project-detail-toggle-developer-actions").click();

  await expect(
    page.getByTestId("project-detail-booking-disabled-reason")
  ).toBeVisible();

  await page.getByTestId("project-detail-create-estimate-deposit").click();
  await expect(
    page.getByTestId("project-detail-deposit-confirm-modal")
  ).toBeVisible();
  await page.getByTestId("project-detail-deposit-confirm-create").click();

  await expect(page.getByTestId("project-detail-deposit-card")).toBeVisible();
  await expect(page.getByTestId("project-detail-deposit-status")).toContainText(
    "Created"
  );

  await page.getByTestId("project-detail-capture-estimate-deposit").click();
  await expect(page.getByTestId("project-detail-deposit-status")).toContainText(
    "Captured"
  );

  const bookingButton = page.getByTestId("project-detail-create-booking-request");
  await expect(bookingButton).toBeEnabled();
  await bookingButton.click();

  await expect(page.getByTestId("project-detail-booking-success")).toBeVisible();
});
