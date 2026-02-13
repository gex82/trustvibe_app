import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  containerTestID?: string;
};

export function FormInput({ label, error, iconName, style, containerTestID, ...rest }: Props): React.JSX.Element {
  return (
    <View testID={containerTestID} style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        {iconName ? <Ionicons name={iconName} size={18} color={colors.textSecondary} /> : null}
        <TextInput
          {...rest}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, style]}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  inputWrapError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: 0,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});
