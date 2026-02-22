export const useEmulators = import.meta.env.VITE_USE_EMULATORS !== "false";
export const enableDemoDataFallback =
  import.meta.env.VITE_DEMO_DATA_FALLBACK !== "false";

function resolveHostFromBrowser(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const host = window.location.hostname?.trim();
  if (!host || host === "0.0.0.0") {
    return null;
  }
  return host;
}

export function resolveEmulatorHost(): string {
  const configured = (import.meta.env.VITE_EMULATOR_HOST ?? "").trim();
  if (configured) {
    return configured;
  }

  return resolveHostFromBrowser() ?? "127.0.0.1";
}

export type DataMode = "live" | "mock";
