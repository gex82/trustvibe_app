import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import type { HomeStackParamList } from '../../navigation/types';
import { logout, mapApiError } from '../../services/api';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<HomeStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const profile = useAppStore((s) => s.profile);
  const role = useAppStore((s) => s.role);
  const roleLabel = role === 'contractor' ? t('auth.roleContractor') : t('auth.roleCustomer');

  function handleLogout(): void {
    Alert.alert(t('profile.logoutConfirmTitle'), t('profile.logoutConfirmBody'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('profile.logoutConfirmAction'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert(t('common.error'), mapApiError(error));
            }
          })();
        },
      },
    ]);
  }

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('profile.title')}</Text>
      <Card>
        <View style={styles.header}>
          <Avatar name={profile?.name ?? 'User'} uri={profile?.avatarUrl} size={72} />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{profile?.name ?? t('common.demoUser')}</Text>
            <Text style={styles.meta}>{profile?.email ?? ''}</Text>
            <Text style={styles.meta}>{roleLabel}</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.groupLabel}>{t('settings.language')}</Text>
      <LanguageSwitcher />

      <Text style={styles.groupLabel}>{t('profile.account')}</Text>
      <PrimaryButton label={t('profile.edit')} onPress={() => navigation.navigate('EditProfile')} />
      <PrimaryButton label={t('profile.documents')} variant="secondary" onPress={() => navigation.navigate('Documents')} />
      <PrimaryButton label={t('messaging.title')} variant="secondary" onPress={() => navigation.navigate('Messages')} />
      <PrimaryButton label={t('history.title')} variant="secondary" onPress={() => navigation.navigate('History')} />
      {role === 'contractor' ? (
        <PrimaryButton label={t('earnings.title')} variant="secondary" onPress={() => navigation.navigate('Earnings')} />
      ) : null}
      <PrimaryButton label={t('settings.title')} variant="secondary" onPress={() => navigation.navigate('Settings')} />
      <PrimaryButton label={t('settings.logout')} variant="danger" onPress={handleLogout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  groupLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
  },
});
