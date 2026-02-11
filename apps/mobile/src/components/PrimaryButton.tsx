import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function PrimaryButton({ label, onPress, disabled = false, variant = 'primary' }: Props): React.JSX.Element {
  const bg = variant === 'primary' ? colors.accent : variant === 'danger' ? colors.danger : colors.bgCard;

  return (
    <Pressable disabled={disabled} style={[styles.button, { backgroundColor: bg }, disabled && styles.disabled]} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  label: {
    color: colors.bg,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
