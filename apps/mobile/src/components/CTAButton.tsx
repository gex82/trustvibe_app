import React from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  style?: ViewStyle;
};

export function CTAButton({ label, onPress, disabled = false, iconName, style }: Props): React.JSX.Element {
  return (
    <Pressable disabled={disabled} style={[styles.button, disabled ? styles.disabled : null, style]} onPress={onPress}>
      {iconName ? <Ionicons name={iconName} size={16} color={colors.textInverse} /> : null}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: radii.md,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  label: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});
