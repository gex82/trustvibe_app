import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  containerTestID?: string;
};

export function FormInput({ label, error, iconName, style, containerTestID, ...rest }: Props): React.JSX.Element {
  const secureInputEnabled = Boolean(rest.secureTextEntry);
  const [isMasked, setIsMasked] = React.useState(secureInputEnabled);

  React.useEffect(() => {
    setIsMasked(secureInputEnabled);
  }, [secureInputEnabled]);

  const visibilityToggleTestID = typeof rest.testID === 'string' ? `${rest.testID}-visibility-toggle` : undefined;

  return (
    <View testID={containerTestID} style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        {iconName ? <Ionicons name={iconName} size={18} color={colors.textSecondary} /> : null}
        <TextInput
          {...rest}
          secureTextEntry={secureInputEnabled ? isMasked : rest.secureTextEntry}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, style]}
        />
        {secureInputEnabled ? (
          <Pressable
            testID={visibilityToggleTestID}
            accessibilityRole="button"
            accessibilityLabel={isMasked ? 'Show password' : 'Hide password'}
            onPress={() => setIsMasked((current) => !current)}
            hitSlop={8}
            style={styles.visibilityToggle}
          >
            <Ionicons
              name={isMasked ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
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
  visibilityToggle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});
