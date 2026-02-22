import { expect, test } from "@playwright/test";
import { adminCreds, loginAs } from "./helpers/session";

test("admin cases action smoke: expand and execute", async ({ page }) => {
  await loginAs(page, "admin", adminCreds.email, adminCreds.password);

  await page.getByTestId("admin-nav-cases").click({ force: true });
  await expect(page.getByTestId("cases-card-list")).toBeVisible({ timeout: 45_000 });

  const expandButton = page.locator('[data-testid^="case-expand-"]').first();
  await expect(expandButton).toBeVisible();
  await expandButton.click({ force: true });

  const refundButton = page.locator('[data-testid^="case-action-refund-"]').first();
  await expect(refundButton).toBeVisible();
  await refundButton.click({ force: true });

  await expect(page.getByTestId("case-result-banner")).toBeVisible({ timeout: 30_000 });
});
