import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/tokens';
import { CTAButton } from './CTAButton';

type Props = {
  title: string;
  description?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
};

export function EmptyState({
  title,
  description,
  ctaLabel,
  onPressCta,
  iconName = 'folder-open-outline',
}: Props): React.JSX.Element {
  return (
    <View style={styles.wrap}>
      <Ionicons name={iconName} size={32} color={colors.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {ctaLabel && onPressCta ? <CTAButton label={ctaLabel} onPress={onPressCta} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});
