import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { logout, mapApiError } from '../../services/api';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const profile = useAppStore((s) => s.profile);

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <Card>
        <View style={styles.profileRow}>
          <Avatar name={profile?.name} uri={profile?.avatarUrl} size={56} />
          <View>
            <Text style={styles.profileName}>{profile?.name ?? t('common.demoUser')}</Text>
            <Text style={styles.profileMeta}>{profile?.email ?? ''}</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.groupLabel}>{t('settings.language')}</Text>
      <LanguageSwitcher testIDPrefix="settings-language" />

      <Text style={styles.groupLabel}>{t('settings.account')}</Text>
      <PrimaryButton testID="settings-payment-methods" label={t('settings.paymentMethods')} variant="secondary" onPress={() => navigation.navigate('PaymentMethods')} />
      <PrimaryButton testID="settings-notifications" label={t('settings.notifications')} variant="secondary" onPress={() => navigation.navigate('Notifications')} />
      <PrimaryButton
        testID="settings-logout"
        label={t('settings.logout')}
        variant="danger"
        onPress={async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert(t('common.error'), mapApiError(error));
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  groupLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  profileMeta: {
    color: colors.textSecondary,
  },
});
