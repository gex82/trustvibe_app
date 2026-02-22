import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, spacing } from '../theme/tokens';

type Props = {
  title: string;
  subtitle: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
};

export function CredentialRow({
  title,
  subtitle,
  iconName = 'document-text-outline',
}: Props): React.JSX.Element {
  return (
    <Card>
      <View style={styles.row}>
        <Ionicons name={iconName} size={18} color={colors.navy} />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
