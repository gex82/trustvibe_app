import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Card } from './Card';
import { colors, spacing } from '../theme/tokens';

type Props = {
  name: string;
  rating: number;
  municipality?: string;
  avatarUri?: string | null;
  onPress?: () => void;
  testID?: string;
};

export function ContractorCard({ name, rating, municipality, avatarUri, onPress, testID }: Props): React.JSX.Element {
  const formattedRating = Number.isFinite(rating) ? rating.toFixed(1) : '0.0';

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed ? styles.pressablePressed : null]}
    >
      <Card>
        <View style={styles.row}>
          <Avatar name={name} uri={avatarUri} size={52} />
          <View style={styles.main}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{name}</Text>
              <Badge label="Verified Pro" />
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="star" size={15} color={colors.warning} />
              <Text style={styles.meta}>{formattedRating}</Text>
              {municipality ? <Text style={styles.meta}>{municipality}</Text> : null}
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 14,
  },
  pressablePressed: {
    opacity: 0.75,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  main: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: spacing.sm,
  },
});
