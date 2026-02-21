export type DemoLang = "en" | "es";
export type DemoLocale = "en-US" | "es-PR";

type LocalizedRecord = Record<string, unknown>;

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function resolveLocale(lang: DemoLang): DemoLocale {
  return lang === "es" ? "es-PR" : "en-US";
}

export function getLocalizedField(
  record: LocalizedRecord,
  baseKey: string,
  lang: DemoLang,
  fallback = ""
): string {
  const localizedKey = `${baseKey}${lang === "es" ? "Es" : "En"}`;
  const alternateKey = `${baseKey}${lang === "es" ? "En" : "Es"}`;

  return (
    asNonEmptyString(record[localizedKey]) ??
    asNonEmptyString(record[baseKey]) ??
    asNonEmptyString(record[alternateKey]) ??
    fallback
  );
}
