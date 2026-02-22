import fs from 'fs';
import path from 'path';

export function getRunDir(): string {
  const runDir = process.env.DEMO_PASS_DIR
    ? path.resolve(process.env.DEMO_PASS_DIR)
    : path.resolve('artifacts', 'demo-pass', 'adhoc');

  fs.mkdirSync(runDir, { recursive: true });
  return runDir;
}

export function sanitizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function resolveMobileUrl(): string {
  return process.env.MOBILE_WEB_URL?.trim() || 'http://localhost:8081';
}

export function resolveAdminUrl(): string {
  return process.env.ADMIN_WEB_URL?.trim() || 'http://localhost:3000';
}

export function toRepoRelative(filePath: string): string {
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}