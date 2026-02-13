import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

type Status = 'completed' | 'in_progress' | 'held';

type Props = {
  status: Status;
};

export function StatusIndicator({ status }: Props): React.JSX.Element {
  const background =
    status === 'completed' ? colors.success : status === 'in_progress' ? colors.info : colors.warning;
  const iconName =
    status === 'completed'
      ? 'checkmark'
      : status === 'in_progress'
      ? 'time-outline'
      : 'lock-closed-outline';

  return (
    <View style={[styles.dot, { backgroundColor: background }]}>
      <Ionicons name={iconName} size={12} color={colors.textInverse} />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
