import { defineConfig } from '@playwright/test';
import path from 'path';

const runDir = process.env.DEMO_PASS_DIR
  ? path.resolve(process.env.DEMO_PASS_DIR)
  : path.resolve('artifacts', 'demo-pass', 'adhoc');
const browserName = process.env.PW_BROWSER ?? 'chromium';
const browserChannel = process.env.PW_CHANNEL;

export default defineConfig({
  testDir: './e2e/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: {
    timeout: 20_000,
  },
  use: {
    browserName: browserName as 'chromium' | 'firefox' | 'webkit',
    channel: browserChannel,
    headless: true,
    testIdAttribute: 'data-testid',
  },
  outputDir: path.join(runDir, 'test-results'),
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(runDir, 'results.json') }],
  ],
});
