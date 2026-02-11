import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { listProjects } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors, spacing } from '../../theme/tokens';

const paidStates = new Set([
  'RELEASED_PAID',
  'EXECUTED_RELEASE_FULL',
  'EXECUTED_RELEASE_PARTIAL',
]);

export function EarningsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const projectsQuery = useQuery({
    queryKey: ['contractor-earnings-projects'],
    queryFn: () => listProjects({ limit: 100 }),
  });

  if (projectsQuery.isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.text}>{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  if (projectsQuery.isError) {
    return (
      <ScreenContainer>
        <Text style={styles.text}>{t('common.error')}</Text>
      </ScreenContainer>
    );
  }

  const projects = projectsQuery.data?.projects ?? [];
  const completed = projects.filter((p) => paidStates.has(String(p.escrowState)));
  const grossCents = completed.reduce((sum, p) => sum + Number(p.heldAmountCents ?? 0), 0);

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('earnings.title')}</Text>
      <Text style={styles.text}>{`${t('earnings.completedProjects')}: ${completed.length}`}</Text>
      <Text style={styles.text}>{`${t('earnings.grossReleased')}: $${(grossCents / 100).toFixed(2)}`}</Text>
      <FlatList
        data={completed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{item.title}</Text>
            <Text style={styles.textMuted}>{item.escrowState}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>{t('earnings.none')}</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  text: { color: colors.textPrimary },
  textMuted: { color: colors.textSecondary },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
});
