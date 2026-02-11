import i18n from 'i18next';
import * as Localization from 'expo-localization';
import { initReactI18next } from 'react-i18next';
import { i18nResources } from '@trustvibe/shared';

const language = Localization.getLocales()[0]?.languageCode === 'es' ? 'es' : 'en';

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: i18nResources,
  lng: language,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
