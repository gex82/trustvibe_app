import path from 'path';
import { expect, type FileChooser, type Page } from '@playwright/test';
import { resolveAdminUrl, resolveMobileUrl } from './runtime';

export const customerCreds = {
  email: 'maria.rodriguez@trustvibe.test',
  password: 'DemoCustomer!123',
};

export const contractorCreds = {
  email: 'juan.services@trustvibe.test',
  password: 'DemoContractor!123',
};

export const adminCreds = {
  email: 'admin@trustvibe.test',
  password: 'DemoAdmin!123',
};

export function attachDialogAutoAccept(page: Page): void {
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });
}

async function gotoWithRetry(page: Page, url: string, attempts = 2): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      return;
    } catch (error) {
      const message = String(error);
      const isNavigationRace =
        message.includes('is interrupted by another navigation') ||
        message.includes('Navigation failed because page was closed');
      lastError = error;
      if (!isNavigationRace || attempt === attempts) {
        throw error;
      }
      await page.waitForTimeout(400);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Navigation failed');
}

export async function waitForAuthEntry(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    return Boolean(
      document.querySelector('[data-testid=\"role-select-customer\"]') ||
        document.querySelector('[data-testid=\"login-email-input\"]')
    );
  });
}

export async function openMobile(page: Page): Promise<void> {
  await gotoWithRetry(page, resolveMobileUrl());
  await waitForAuthEntry(page);
}

export async function selectRole(page: Page, role: 'customer' | 'contractor'): Promise<void> {
  const id = role === 'customer' ? 'role-select-customer' : 'role-select-contractor';
  const roleButton = page.getByTestId(id);
  if (await roleButton.count()) {
    await roleButton.click();
  }
  await expect(page.getByTestId('login-email-input')).toBeVisible();
}

export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('home-language-container')).toBeVisible({ timeout: 45_000 });
}

export async function loginAs(page: Page, role: 'customer' | 'contractor', email: string, password: string): Promise<void> {
  await openMobile(page);
  await selectRole(page, role);
  await login(page, email, password);
}

export async function goToTab(page: Page, tabId: 'tab-home' | 'tab-search' | 'tab-projects' | 'tab-profile'): Promise<void> {
  const tabById = page.getByTestId(tabId);
  if (await tabById.count()) {
    await tabById.first().click();
    return;
  }

  const fallbackPatterns: Record<typeof tabId, RegExp> = {
    'tab-home': /home|inicio/i,
    'tab-search': /search|buscar/i,
    'tab-projects': /projects|proyectos/i,
    'tab-profile': /profile|perfil/i,
  };

  const routeByTab: Record<typeof tabId, string> = {
    'tab-home': 'HomeTab',
    'tab-search': 'SearchTab',
    'tab-projects': 'ProjectsTab',
    'tab-profile': 'ProfileTab',
  };

  const fallbackLink = page.getByRole('link', { name: fallbackPatterns[tabId] }).first();
  if (await fallbackLink.count()) {
    await fallbackLink.click();
    return;
  }

  await page.goto(`${resolveMobileUrl()}/${routeByTab[tabId]}`, { waitUntil: 'domcontentloaded' });
}

export async function setLanguage(page: Page, scope: 'home' | 'profile' | 'role' | 'settings', language: 'en' | 'es'): Promise<void> {
  await page.getByTestId(`${scope}-language-${language}`).click();
}

export async function logoutFromHome(page: Page): Promise<void> {
  await page.getByTestId('home-quick-logout').click();
  await waitForAuthEntry(page);
}

export async function uploadViaFileChooser(
  page: Page,
  triggerTestId: string,
  relativeFilePath: string
): Promise<void> {
  const absolutePath = path.resolve(relativeFilePath);

  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByTestId(triggerTestId).click();
  const chooser: FileChooser = await chooserPromise;
  await chooser.setFiles(absolutePath);
}

export async function loginAdmin(page: Page): Promise<void> {
  attachDialogAutoAccept(page);

  await gotoWithRetry(page, `${resolveAdminUrl()}/users`);
  const directUsersTable = page.getByTestId('users-table');
  if (await directUsersTable.count()) {
    await expect(directUsersTable).toBeVisible({ timeout: 15_000 });
    return;
  }

  await gotoWithRetry(page, `${resolveAdminUrl()}/login`);
  await page.getByTestId('admin-login-email').fill(adminCreds.email);
  await page.getByTestId('admin-login-password').fill(adminCreds.password);
  await page.getByTestId('admin-login-submit').click();
  await page.waitForTimeout(1500);

  const loginError = page.getByTestId('admin-login-error');
  if ((await loginError.count()) && (await loginError.first().isVisible())) {
    const message = await loginError.first().textContent();
    throw new Error(`Admin login failed: ${message ?? 'unknown error'}`);
  }

  await gotoWithRetry(page, `${resolveAdminUrl()}/users`);
  await expect(page.getByTestId('users-table')).toBeVisible({ timeout: 45_000 });
}
