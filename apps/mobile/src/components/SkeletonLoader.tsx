import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radii } from '../theme/tokens';

type Props = {
  height?: number;
  style?: ViewStyle;
};

export function SkeletonLoader({ height = 16, style }: Props): React.JSX.Element {
  return <View style={[styles.base, { height }, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.sm,
  },
});
