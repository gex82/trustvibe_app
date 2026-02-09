import en from './i18n/en.json';
import es from './i18n/es.json';

export const i18nResources = {
  en: { translation: en },
  es: { translation: es },
};

export type SupportedLanguage = keyof typeof i18nResources;
