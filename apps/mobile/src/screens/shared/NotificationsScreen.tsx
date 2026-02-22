import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { colors, spacing } from '../../theme/tokens';

export function NotificationsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const demoItems = [
    t('notifications.newQuote'),
    t('notifications.contractorSelected'),
    t('notifications.escrowFunded'),
    t('notifications.completionRequested'),
  ];

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('settings.notifications')}</Text>
      <Text style={styles.subtitle}>{t('notifications.emptyDescription')}</Text>
      <View style={styles.list}>
        {demoItems.map((label, index) => (
          <Card key={label}>
            <Text style={styles.itemTitle}>{label}</Text>
            <Text style={styles.itemMeta}>{`#${index + 1}`}</Text>
          </Card>
        ))}
      </View>
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
  subtitle: {
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.sm,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  itemMeta: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 12,
  },
});
