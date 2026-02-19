import { expect, test, type Page } from '@playwright/test';
import {
  attachDialogAutoAccept,
  customerCreds,
  goToTab,
  loginAs,
  openMobile,
  selectRole,
  waitForAuthEntry,
} from './helpers/session';
import { captureStep } from './helpers/screenshots';

async function openProjectCardById(page: Page, projectId: string): Promise<void> {
  const target = page.getByTestId(`projects-list-card-${projectId}`);
  for (let index = 0; index < 24; index += 1) {
    if (await target.count()) {
      await target.first().scrollIntoViewIfNeeded();
      await target.first().click();
      return;
    }
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(120);
  }
  throw new Error(`Unable to find project card for ${projectId}`);
}

test('manual qa: auth reliability checks', async ({ page }, testInfo) => {
  attachDialogAutoAccept(page);
  await openMobile(page);
  await selectRole(page, 'customer');

  await page.getByTestId('login-email-input').fill(customerCreds.email);
  await page.getByTestId('login-password-input').fill('WrongPassword!123');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 20_000 });
  await captureStep(page, testInfo, 'invalid-credentials-error');

  await page.getByTestId('login-email-input').fill(customerCreds.email);
  await page.getByTestId('login-reset-password').click();
  await expect(page.getByTestId('login-submit')).toBeVisible();

  await page.getByTestId('login-go-register').click();
  await expect(page.getByTestId('register-submit')).toBeVisible();

  const registerPasswordInput = page.getByTestId('register-password-input');
  await expect(registerPasswordInput).toBeVisible();
  await expect(registerPasswordInput).toHaveAttribute('type', 'password');
  await page.getByTestId('register-password-input-visibility-toggle').click();
  await expect(registerPasswordInput).not.toHaveAttribute('type', 'password');
  await page.getByTestId('register-password-input-visibility-toggle').click();
  await expect(registerPasswordInput).toHaveAttribute('type', 'password');

  await page.getByTestId('register-go-login').click();
  await expect(page.getByTestId('login-submit')).toBeVisible();

  await page.getByTestId('login-go-register').click();
  const uniqueEmail = `web.demo.${Date.now()}@trustvibe.test`;
  await page.getByTestId('register-name-input').fill('Web Demo User');
  await page.getByTestId('register-email-input').fill(uniqueEmail);
  await page.getByTestId('register-phone-input').fill('7875551212');
  await page.getByTestId('register-password-input').fill('DemoUser!123');
  await page.getByTestId('register-confirm-password-input').fill('DemoUser!123');
  await expect(page.getByTestId('register-submit')).toHaveAttribute('aria-disabled', 'true');
  await page.getByTestId('register-accept-terms').click();
  await expect(page.getByTestId('register-terms-modal')).toBeVisible();
  await page.getByTestId('register-terms-lang-es').click();
  await page.getByTestId('register-terms-lang-en').click();
  await page.getByTestId('register-terms-accept').click();
  await expect(page.getByTestId('register-submit')).not.toHaveAttribute('aria-disabled', 'true');
  await page.getByTestId('register-submit').click();

  await expect(page.getByTestId('home-language-container')).toBeVisible({ timeout: 45_000 });
  await captureStep(page, testInfo, 'register-success-home');

  await goToTab(page, 'tab-profile');
  await page.getByTestId('profile-logout').click();
  await waitForAuthEntry(page);
});

test('manual qa: home quick logout is visible and works', async ({ page }, testInfo) => {
  attachDialogAutoAccept(page);
  await loginAs(page, 'customer', customerCreds.email, customerCreds.password);

  await expect(page.getByTestId('home-quick-logout')).toBeVisible();
  await page.getByTestId('home-quick-logout').click();
  await waitForAuthEntry(page);
  await captureStep(page, testInfo, 'home-quick-logout');
});

test('manual qa: home activity row opens project detail', async ({ page }, testInfo) => {
  attachDialogAutoAccept(page);
  await loginAs(page, 'customer', customerCreds.email, customerCreds.password);
  await goToTab(page, 'tab-home');

  const activity = page.locator('[data-testid^="home-activity-"]').first();
  await expect(activity).toBeVisible({ timeout: 20_000 });
  await activity.click();

  await expect(page.getByTestId('project-detail-workflow-card')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('project-detail-workflow-state')).toBeVisible();
  await captureStep(page, testInfo, 'home-activity-project-detail');
});

test('manual qa: agreement and deposit transparency checkpoints', async ({ page }, testInfo) => {
  attachDialogAutoAccept(page);
  await loginAs(page, 'customer', customerCreds.email, customerCreds.password);
  await goToTab(page, 'tab-projects');
  await openProjectCardById(page, 'project-021');

  const selectContractor = page.getByTestId('project-detail-select-contractor');
  await expect(selectContractor).toBeVisible({ timeout: 20_000 });
  await selectContractor.click();

  const quoteCard = page.locator('[data-testid^="quote-card-"]').first();
  await expect(quoteCard).toBeVisible({ timeout: 20_000 });
  await expect(quoteCard.locator('[data-testid^="quote-contractor-"]').first()).toBeVisible();
  await expect(quoteCard.locator('[data-testid^="quote-price-"]').first()).toBeVisible();
  await expect(quoteCard.locator('[data-testid^="quote-timeline-"]').first()).toBeVisible();
  await expect(quoteCard.locator('[data-testid^="quote-scope-"]').first()).toBeVisible();

  const quoteSelect = page.locator('[data-testid^="quote-select-"]').first();
  await expect(quoteSelect).toBeVisible();
  await quoteSelect.click();

  await expect(page.getByTestId('agreement-review-card')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('agreement-review-contractor')).toBeVisible();
  await expect(page.getByTestId('agreement-review-price')).toBeVisible();
  await expect(page.getByTestId('agreement-review-timeline')).toBeVisible();
  await expect(page.getByTestId('agreement-review-scope')).toBeVisible();
  await expect(page.getByTestId('agreement-review-policy')).toBeVisible();
  await expect(page.getByTestId('agreement-review-fee')).toBeVisible();

  await page.getByTestId('agreement-review-accept').click();
  await page.waitForTimeout(1500);

  await goToTab(page, 'tab-projects');
  await openProjectCardById(page, 'project-021');
  await expect(page.getByTestId('project-detail-workflow-card')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('project-detail-workflow-agreement')).toBeVisible();

  const developerToggle = page.getByTestId('project-detail-toggle-developer-actions');
  if (await developerToggle.count()) {
    await developerToggle.click();
  }

  const createDeposit = page.getByTestId('project-detail-create-estimate-deposit');
  await expect(createDeposit).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('project-detail-workflow-quote-amount')).toBeVisible();
  await expect(page.getByTestId('project-detail-workflow-timeline')).toBeVisible();

  await captureStep(page, testInfo, 'agreement-deposit-transparency');
});
