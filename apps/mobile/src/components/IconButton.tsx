import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';

type Props = {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  size?: number;
};

export function IconButton({ iconName, onPress, size = 20 }: Props): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Ionicons name={iconName} size={size} color={colors.navyDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xs,
  },
});
