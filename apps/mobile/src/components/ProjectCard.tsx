import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { colors, spacing } from '../theme/tokens';

type Props = {
  title: string;
  phaseLabel: string;
  progress: number;
  onPress?: () => void;
  testID?: string;
};

export function ProjectCard({ title, phaseLabel, progress, onPress, testID }: Props): React.JSX.Element {
  return (
    <Pressable testID={testID} onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.progress}>{Math.round(progress)}%</Text>
        </View>
        <ProgressBar progress={progress} />
        <Text style={styles.phase}>{phaseLabel}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
    maxWidth: '80%',
  },
  progress: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  phase: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 15,
  },
});
