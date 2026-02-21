export function resolveDemoWebUrl(): string {
  return process.env.DEMO_WEB_URL?.trim() || "http://localhost:5174";
}
