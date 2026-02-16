import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

type Variant = 'verified' | 'success' | 'info' | 'warning';

type Props = {
  label: string;
  variant?: Variant;
};

export function Badge({ label, variant = 'verified' }: Props): React.JSX.Element {
  const bg =
    variant === 'verified'
      ? colors.navy
      : variant === 'success'
      ? colors.success
      : variant === 'warning'
      ? colors.warning
      : colors.info;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  text: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
