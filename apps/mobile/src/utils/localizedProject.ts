export type AppLanguage = 'en' | 'es';

type LocalizedRecord = {
  [key: string]: unknown;
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getLocalizedField(record: LocalizedRecord, baseKey: string, language: AppLanguage, fallback = ''): string {
  const localizedKey = `${baseKey}${language === 'es' ? 'Es' : 'En'}`;
  const alternateKey = `${baseKey}${language === 'es' ? 'En' : 'Es'}`;

  return (
    asNonEmptyString(record[localizedKey]) ??
    asNonEmptyString(record[baseKey]) ??
    asNonEmptyString(record[alternateKey]) ??
    fallback
  );
}

export function getLocalizedProjectTitle(project: LocalizedRecord, language: AppLanguage): string {
  return getLocalizedField(project, 'title', language, '');
}

export function getLocalizedProjectDescription(project: LocalizedRecord, language: AppLanguage): string {
  return getLocalizedField(project, 'description', language, '');
}
