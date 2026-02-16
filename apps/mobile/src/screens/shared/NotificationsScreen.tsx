import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing } from '../../theme/tokens';

export function NotificationsScreen(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('settings.notifications')}</Text>
      <EmptyState
        title={t('notifications.emptyTitle')}
        description={t('notifications.emptyDescription')}
        iconName="notifications-outline"
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
});
