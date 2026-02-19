import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, spacing } from '../theme/tokens';

type Props = {
  title: string;
  bullets: string[];
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  testID?: string;
};

export function TrustCallout({
  title,
  bullets,
  iconName = 'shield-checkmark-outline',
  testID = 'trust-callout',
}: Props): React.JSX.Element {
  return (
    <Card testID={testID} style={styles.card}>
      <View style={styles.header}>
        <Ionicons name={iconName} size={20} color={colors.success} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.list}>
        {bullets.map((bullet, index) => (
          <View key={`${bullet}-${index}`} style={styles.item}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.body}>{bullet}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EEF9F1',
    borderColor: '#BFE6CA',
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    gap: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  body: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
});

