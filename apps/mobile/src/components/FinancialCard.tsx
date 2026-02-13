import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from './Card';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  totalCents: number;
};

export function FinancialCard({ totalCents }: Props): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Card>
      <View style={styles.row}>
        <Text style={styles.label}>{t('home.totalFundsSecuredInEscrow')}</Text>
        <Ionicons name="lock-closed" size={18} color={colors.warning} />
      </View>
      <Text style={styles.amount}>${(totalCents / 100).toLocaleString()}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    maxWidth: '85%',
  },
  amount: {
    ...typography.amount,
  },
});
