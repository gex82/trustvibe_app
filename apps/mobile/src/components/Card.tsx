import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme/tokens';

type Props = ViewProps & {
  padded?: boolean;
};

export function Card({ children, style, padded = true, ...rest }: Props): React.JSX.Element {
  return (
    <View {...rest} style={[styles.card, padded ? styles.padded : null, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radii.md,
    ...shadows.card,
  },
  padded: {
    padding: spacing.md,
  },
});
