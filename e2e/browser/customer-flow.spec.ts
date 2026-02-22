import { expect, test, type Page } from '@playwright/test';
import { expectHomeEnglish, expectHomeSpanish } from './helpers/assertions';
import {
  attachDialogAutoAccept,
  customerCreds,
  goToTab,
  loginAs,
  logoutFromHome,
  uploadViaFileChooser,
} from './helpers/session';
import { captureStep } from './helpers/screenshots';

async function clickAnyContractorCard(page: Page): Promise<void> {
  const selectors = [
    '[data-testid^="search-recommended-contractor-"]',
    '[data-testid^="search-featured-contractor-"]',
    '[data-testid="search-fallback-contractor"]',
  ];

  for (let attempt = 0; attempt < 8; attempt += 1) {
    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      if (!(await locator.count())) {
        continue;
      }
      try {
        await locator.click({ timeout: 4_000 });
        return;
      } catch {
        await page.waitForTimeout(200);
      }
    }
    await page.waitForTimeout(250);
  }

  throw new Error('No contractor cards could be clicked in Search screen.');
}

test('customer flow: web click path', async ({ page }, testInfo) => {
  attachDialogAutoAccept(page);

  await loginAs(page, 'customer', customerCreds.email, customerCreds.password);
  await captureStep(page, testInfo, 'customer-home-initial');

  await page.getByTestId('home-language-es').click();
  await expectHomeSpanish(page);
  await captureStep(page, testInfo, 'customer-home-spanish');

  await page.getByTestId('home-language-en').click();
  await expectHomeEnglish(page);

  await goToTab(page, 'tab-search');
  await expect(page.getByTestId('search-query-input')).toBeVisible();
  await captureStep(page, testInfo, 'customer-search');

  await clickAnyContractorCard(page);

  await expect(page.getByTestId('contractor-profile-title')).toBeVisible();
  await captureStep(page, testInfo, 'customer-contractor-profile');

  await goToTab(page, 'tab-projects');
  const projectByTestId = page.locator('[data-testid^="projects-list-card-"]').first();
  if (await projectByTestId.count()) {
    await projectByTestId.click();
  } else {
    const projectEntry = page.locator('div:visible').filter({ hasText: /Primary Bathroom Renovation|Remodelacion de bano principal/i }).first();
    await expect(projectEntry).toBeVisible();
    await projectEntry.click();
  }

  const milestoneLedger = page.getByText(/Milestone Ledger|Registro de hitos/i);
  const hasLedger = await milestoneLedger.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
  if (hasLedger) {
    await captureStep(page, testInfo, 'customer-project-detail');
  } else {
    await captureStep(page, testInfo, 'customer-project-list-fallback');
  }

  await goToTab(page, 'tab-profile');
  await expect(page.getByTestId('profile-documents')).toBeVisible();
  await page.getByTestId('profile-documents').click();
  await expect(page.getByTestId('documents-upload')).toBeVisible();

  await uploadViaFileChooser(page, 'documents-upload', 'apps/mobile/assets/demo/documents/license_certificate_mock.txt');
  await expect(page.locator('[data-testid^="documents-url-"]').first()).toBeVisible({ timeout: 30_000 });
  await captureStep(page, testInfo, 'customer-documents-uploaded');

  await goToTab(page, 'tab-home');
  await logoutFromHome(page);
  await captureStep(page, testInfo, 'customer-logged-out');
});
