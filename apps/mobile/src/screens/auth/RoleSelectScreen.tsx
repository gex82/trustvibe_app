import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useAppStore } from '../../store/appStore';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelect'>;

export function RoleSelectScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const setRole = useAppStore((s) => s.setRole);

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>TrustVibe</Text>
      <Text style={styles.subtitle}>{t('auth.tagline')}</Text>
      <View style={styles.languageRow}>
        <Text style={styles.languageLabel}>{t('settings.language')}</Text>
        <LanguageSwitcher />
      </View>

      <Card>
        <View style={styles.roleCard}>
          <Text style={styles.roleTitle}>{t('auth.roleCustomer')}</Text>
          <Text style={styles.roleText}>{t('auth.roleCustomerDescription')}</Text>
          <PrimaryButton
            label={t('auth.continueAsCustomer')}
            onPress={() => {
              setRole('customer');
              navigation.navigate('Login');
            }}
          />
        </View>
      </Card>

      <Card>
        <View style={styles.roleCard}>
          <Text style={styles.roleTitle}>{t('auth.roleContractor')}</Text>
          <Text style={styles.roleText}>{t('auth.roleContractorDescription')}</Text>
          <PrimaryButton
            label={t('auth.continueAsContractor')}
            variant="secondary"
            onPress={() => {
              setRole('contractor');
              navigation.navigate('Login');
            }}
          />
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    gap: spacing.md,
  },
  languageRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  languageLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  roleCard: {
    gap: spacing.sm,
  },
  roleTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  roleText: {
    color: colors.textSecondary,
  },
});
