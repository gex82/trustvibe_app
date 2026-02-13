import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { listProjects, mapApiError } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing } from '../../theme/tokens';
import { getEscrowStateLabel } from '../../utils/escrowState';

const paidStates = new Set(['RELEASED_PAID', 'EXECUTED_RELEASE_FULL', 'EXECUTED_RELEASE_PARTIAL']);

export function EarningsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const projectsQuery = useQuery({
    queryKey: ['contractor-earnings-projects'],
    queryFn: () => listProjects({ limit: 100 }),
  });

  const projects = projectsQuery.data?.projects ?? [];
  const completed = projects.filter((p) => paidStates.has(String(p.escrowState)));
  const grossCents = completed.reduce((sum, p) => sum + Number(p.heldAmountCents ?? 0), 0);

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('earnings.title')}</Text>
      <Card>
        <Text style={styles.totalLabel}>{t('earnings.grossReleased')}</Text>
        <Text style={styles.totalValue}>{`$${(grossCents / 100).toLocaleString()}`}</Text>
        <Text style={styles.meta}>{`${t('earnings.completedProjects')}: ${completed.length}`}</Text>
      </Card>

      {projectsQuery.isError ? <Text style={styles.error}>{mapApiError(projectsQuery.error)}</Text> : null}

      <FlatList
        data={completed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.meta}>{getEscrowStateLabel(t, item.escrowState)}</Text>
          </Card>
        )}
        ListEmptyComponent={
          projectsQuery.isLoading ? (
            <Text style={styles.meta}>{t('common.loading')}</Text>
          ) : (
            <EmptyState title={t('earnings.none')} description={t('earnings.completedAfterRelease')} />
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  totalLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  totalValue: {
    color: colors.navy,
    fontSize: 34,
    fontWeight: '800',
  },
  itemTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  meta: { color: colors.textSecondary },
  error: { color: colors.danger },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
});
