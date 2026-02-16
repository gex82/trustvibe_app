import React from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';

type Props = TextInputProps & {
  containerTestID?: string;
};

export function SearchBar({ containerTestID, ...props }: Props): React.JSX.Element {
  return (
    <View testID={containerTestID} style={styles.wrap}>
      <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
      <TextInput
        {...props}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, props.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: 0,
  },
});
