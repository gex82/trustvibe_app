import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

type Props = {
  focused: boolean;
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
};

export function TabBarIcon({ focused, name, size = 22 }: Props): React.JSX.Element {
  return <Ionicons name={name} size={size} color={focused ? colors.tabActive : colors.tabInactive} />;
}
