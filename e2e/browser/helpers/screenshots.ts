import fs from 'fs';
import path from 'path';
import type { Page, TestInfo } from '@playwright/test';
import { getRunDir, sanitizeName, toRepoRelative } from './runtime';

export async function captureStep(page: Page, testInfo: TestInfo, label: string): Promise<string> {
  const screenshotsDir = path.join(getRunDir(), 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const fileName = `${sanitizeName(testInfo.title)}--${sanitizeName(label)}.png`;
  const filePath = path.join(screenshotsDir, fileName);
  await page.screenshot({ path: filePath, fullPage: true });

  const relativePath = toRepoRelative(filePath);
  await testInfo.attach(label, {
    path: filePath,
    contentType: 'image/png',
  });

  return relativePath;
}