import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/tokens';

type Props = {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
  testIDPrefix?: string;
};

export function StarRating({
  value,
  onChange,
  size = 32,
  disabled = false,
  testIDPrefix = 'review-star',
}: Props): React.JSX.Element {
  return (
    <View style={styles.row}>
      {Array.from({ length: 5 }).map((_, index) => {
        const rating = index + 1;
        const filled = rating <= value;
        return (
          <Pressable
            key={rating}
            testID={`${testIDPrefix}-${rating}`}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Set rating to ${rating}`}
            style={({ pressed }) => [styles.starButton, pressed ? styles.pressed : null]}
            onPress={() => onChange(rating)}
          >
            <Ionicons name={filled ? 'star' : 'star-outline'} size={size} color={filled ? colors.warning : colors.textSecondary} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  starButton: {
    paddingVertical: spacing.xxs,
  },
  pressed: {
    opacity: 0.75,
  },
});

