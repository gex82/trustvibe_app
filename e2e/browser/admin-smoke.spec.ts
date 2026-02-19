import { expect, test } from '@playwright/test';
import { captureStep } from './helpers/screenshots';
import { loginAdmin } from './helpers/session';

test('admin smoke: config toggles and tables', async ({ page }, testInfo) => {
  await loginAdmin(page);
  await captureStep(page, testInfo, 'admin-users');

  await page.getByTestId('admin-nav-config').click();
  await expect(page.getByTestId('config-save')).toBeVisible();
  await captureStep(page, testInfo, 'admin-config');

  await page.getByTestId('admin-nav-cases').click();
  await expect(page.getByTestId('cases-table')).toBeVisible();
  await captureStep(page, testInfo, 'admin-cases');

  await page.getByTestId('admin-nav-users').click();
  await expect(page.getByTestId('users-table')).toBeVisible();
  await captureStep(page, testInfo, 'admin-users-final');
});
