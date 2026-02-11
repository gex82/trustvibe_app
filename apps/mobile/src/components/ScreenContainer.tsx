import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, spacing } from '../theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenContainer({ children, style }: Props): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
