import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

export type FilterChipItem = {
  label: string;
  value: string;
  active: boolean;
  testID?: string;
};

type Props = {
  filters: FilterChipItem[];
  onToggle: (value: string) => void;
  testIDPrefix?: string;
};

export function FilterChips({
  filters,
  onToggle,
  testIDPrefix = 'filter-chip',
}: Props): React.JSX.Element {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wrap}>
      {filters.map((filter) => (
        <Pressable
          key={filter.value}
          testID={filter.testID ?? `${testIDPrefix}-${filter.value}`}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.chip,
            filter.active ? styles.chipActive : styles.chipInactive,
            pressed ? styles.chipPressed : null,
          ]}
          onPress={() => onToggle(filter.value)}
        >
          <Text style={[styles.label, filter.active ? styles.labelActive : styles.labelInactive]}>{filter.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  chip: {
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    borderColor: colors.navyLight,
    backgroundColor: colors.navyLight,
  },
  chipInactive: {
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  chipPressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  labelActive: {
    color: colors.textInverse,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
});

