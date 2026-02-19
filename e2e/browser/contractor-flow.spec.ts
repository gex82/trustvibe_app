import { expect, test } from '@playwright/test';
import { expectHomeEnglish, expectHomeSpanish } from './helpers/assertions';
import {
  attachDialogAutoAccept,
  contractorCreds,
  goToTab,
  loginAs,
  logoutFromHome,
  uploadViaFileChooser,
} from './helpers/session';
import { captureStep } from './helpers/screenshots';

test('contractor flow: web click path', async ({ page }, testInfo) => {
  attachDialogAutoAccept(page);

  await loginAs(page, 'contractor', contractorCreds.email, contractorCreds.password);
  await captureStep(page, testInfo, 'contractor-home-initial');

  await page.getByTestId('home-language-es').click();
  await expectHomeSpanish(page);
  await page.getByTestId('home-language-en').click();
  await expectHomeEnglish(page);

  await goToTab(page, 'tab-projects');
  const projectEntry = page
    .locator('div:visible')
    .filter({ hasText: /Interior Painting Refresh|Pintura interior de sala y pasillo|Primary Bathroom Renovation/i })
    .first();
  await expect(projectEntry).toBeVisible();
  await projectEntry.click();
  const milestoneLedger = page.getByText(/Milestone Ledger|Registro de hitos/i);
  const hasLedger = await milestoneLedger.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
  if (hasLedger) {
    await captureStep(page, testInfo, 'contractor-project-detail');
  } else {
    await captureStep(page, testInfo, 'contractor-project-list-fallback');
  }

  const openMessagesButton = page.getByTestId('project-detail-open-messages');
  if (await openMessagesButton.count()) {
    await openMessagesButton.click();
  } else {
    await goToTab(page, 'tab-profile');
    await page.getByTestId('profile-messages').click();
  }
  await expect(page.getByTestId('messages-input')).toBeVisible();
  await page.getByTestId('messages-input').fill('Status update from automated web demo pass.');
  await page.getByTestId('messages-send').click();
  await page.waitForTimeout(1500);
  await captureStep(page, testInfo, 'contractor-message-sent');

  await goToTab(page, 'tab-profile');
  await page.getByTestId('profile-edit').click();
  await expect(page.getByTestId('edit-profile-upload-avatar')).toBeVisible();
  await uploadViaFileChooser(page, 'edit-profile-upload-avatar', 'apps/mobile/assets/demo/avatars/juan_services.png');
  await page.getByTestId('edit-profile-save').click();
  await expect(page.getByTestId('profile-documents')).toBeVisible();
  await captureStep(page, testInfo, 'contractor-profile-saved');

  await page.getByTestId('profile-documents').click();
  await expect(page.getByTestId('documents-upload')).toBeVisible();
  await uploadViaFileChooser(page, 'documents-upload', 'apps/mobile/assets/demo/documents/general_liability_mock.txt');
  await expect(page.locator('[data-testid^="documents-url-"]').first()).toBeVisible({ timeout: 30_000 });
  await captureStep(page, testInfo, 'contractor-document-uploaded');

  await goToTab(page, 'tab-profile');
  await page.getByTestId('profile-history').click();
  await expect(page.getByText(/Transactions|Transacciones/i)).toBeVisible();

  await goToTab(page, 'tab-profile');
  const earningsButton = page.getByTestId('profile-earnings');
  if (await earningsButton.count()) {
    await earningsButton.click();
    await expect(page.getByText(/Gross released|Total liberado/i)).toBeVisible();
    await goToTab(page, 'tab-profile');
  }

  await goToTab(page, 'tab-home');
  await logoutFromHome(page);
  await captureStep(page, testInfo, 'contractor-logged-out');
});
