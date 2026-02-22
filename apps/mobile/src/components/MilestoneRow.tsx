import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { StatusIndicator } from './StatusIndicator';
import { colors, spacing } from '../theme/tokens';

type Status = 'completed' | 'in_progress' | 'held';

type Props = {
  title: string;
  subtitle: string;
  status: Status;
};

export function MilestoneRow({ title, subtitle, status }: Props): React.JSX.Element {
  return (
    <Card>
      <View style={styles.row}>
        <StatusIndicator status={status} />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 17,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});
