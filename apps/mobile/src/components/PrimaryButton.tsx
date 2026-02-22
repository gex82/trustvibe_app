import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  testID?: string;
};

export function PrimaryButton({ label, onPress, disabled = false, variant = 'primary', testID }: Props): React.JSX.Element {
  const bg = variant === 'primary' ? colors.navy : variant === 'danger' ? colors.danger : colors.backgroundSecondary;
  const labelColor = variant === 'secondary' ? colors.navyDark : colors.textInverse;

  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      style={[styles.button, { backgroundColor: bg }, disabled && styles.disabled]}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
