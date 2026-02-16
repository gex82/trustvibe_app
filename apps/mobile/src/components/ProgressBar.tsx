import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii } from '../theme/tokens';

type Props = {
  progress: number;
};

export function ProgressBar({ progress }: Props): React.JSX.Element {
  const widthPercent = Math.max(0, Math.min(100, progress));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${widthPercent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.navyLight,
    borderRadius: radii.full,
  },
});
