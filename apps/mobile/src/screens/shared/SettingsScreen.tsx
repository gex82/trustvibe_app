import React from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { logout } from '../../services/api';
import { useAppStore } from '../../store/appStore';
import { colors } from '../../theme/tokens';

export function SettingsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  return (
    <ScreenContainer>
      <Text style={styles.text}>{t('settings.title')}</Text>
      <Text style={styles.text}>{t('settings.language')}</Text>

      <PrimaryButton
        label={t('settings.language.en')}
        onPress={() => {
          setLanguage('en');
          void i18n.changeLanguage('en');
        }}
        variant={language === 'en' ? 'primary' : 'secondary'}
      />
      <PrimaryButton
        label={t('settings.language.es')}
        onPress={() => {
          setLanguage('es');
          void i18n.changeLanguage('es');
        }}
        variant={language === 'es' ? 'primary' : 'secondary'}
      />

      <PrimaryButton
        label={t('settings.logout')}
        variant="danger"
        onPress={async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert(t('common.error'), String(error));
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.textPrimary,
    marginBottom: 12,
  },
});
