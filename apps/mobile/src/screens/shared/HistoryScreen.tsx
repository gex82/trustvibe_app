import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { listProjects, mapApiError } from '../../services/api';
import { db } from '../../services/firebase';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';
import { getLocalizedProjectTitle } from '../../utils/localizedProject';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'History'>;
type LedgerEvent = {
  id: string;
  projectId: string;
  type: string;
  createdAt: string;
  amountCents?: number;
};

const PROJECT_LIMIT = 30;
const EVENTS_PER_PROJECT_LIMIT = 10;
const TOTAL_EVENTS_LIMIT = 40;

function formatLedgerType(type: string): string {
  return type
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatEventTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function resolveProjectLabel(projectId: string, projectTitleById: Map<string, string>, fallback: string): string {
  const title = projectTitleById.get(projectId);
  if (title) {
    return title;
  }
  return projectId || fallback;
}

export function HistoryScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const language = useAppStore((s) => s.language);

  const projectsQuery = useQuery({
    queryKey: ['history-projects'],
    queryFn: () => listProjects({ limit: PROJECT_LIMIT }),
  });

  const projects = React.useMemo(() => projectsQuery.data?.projects ?? [], [projectsQuery.data?.projects]);
  const projectTitleById = React.useMemo(
    () =>
      new Map(
        projects.map((project) => [project.id, getLocalizedProjectTitle(project, language)] as const)
      ),
    [language, projects]
  );

  const historyEventsQuery = useQuery({
    queryKey: ['history-ledger-events', projects.map((project) => project.id).join(',')],
    enabled: projects.length > 0,
    queryFn: async () => {
      const snapshots = await Promise.all(
        projects.map((project) =>
          getDocs(
            query(
              collection(db, 'ledgers', project.id, 'events'),
              orderBy('createdAt', 'desc'),
              limit(EVENTS_PER_PROJECT_LIMIT)
            )
          )
        )
      );

      const events: LedgerEvent[] = [];
      for (const snapshot of snapshots) {
        for (const item of snapshot.docs) {
          const data = item.data() as Record<string, unknown>;
          events.push({
            id: item.id,
            projectId: String(data.projectId ?? ''),
            type: String(data.type ?? 'UNKNOWN_EVENT'),
            createdAt: String(data.createdAt ?? ''),
            amountCents: typeof data.amountCents === 'number' ? data.amountCents : undefined,
          });
        }
      }

      return events
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, TOTAL_EVENTS_LIMIT);
    },
  });

  const historyEvents = historyEventsQuery.data ?? [];
  const loading = projectsQuery.isLoading || historyEventsQuery.isLoading;
  const hasError = projectsQuery.isError || historyEventsQuery.isError;
  const error = projectsQuery.error ?? historyEventsQuery.error;

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('history.title')}</Text>
      <Text style={styles.subtitle}>{t('history.transactions')}</Text>

      {hasError ? <Text style={styles.error}>{mapApiError(error)}</Text> : null}

      <View style={styles.list}>
        {!loading && historyEvents.length === 0 ? (
          <EmptyState title={t('common.noData')} description={t('earnings.completedAfterRelease')} />
        ) : null}

        {loading ? <Text style={styles.itemMeta}>{t('common.loading')}</Text> : null}

        {historyEvents.map((event) => (
          <Card key={event.id}>
            <Text style={styles.itemTitle}>{formatLedgerType(event.type)}</Text>
            <Text style={styles.itemMeta}>
              {resolveProjectLabel(event.projectId, projectTitleById, t('common.noData'))}
            </Text>
            <Text style={styles.itemMeta}>
              {event.amountCents != null ? `$${(event.amountCents / 100).toLocaleString()} • ` : ''}
              {formatEventTimestamp(event.createdAt)}
            </Text>
          </Card>
        ))}
      </View>

      <PrimaryButton label={t('phase2.recommendationsTitle')} variant="secondary" onPress={() => navigation.navigate('Recommendations')} />
      {role === 'contractor' ? (
        <PrimaryButton label={t('availability.title')} variant="secondary" onPress={() => navigation.navigate('Availability')} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.sm,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  itemMeta: {
    color: colors.textSecondary,
  },
  error: {
    color: colors.danger,
  },
});
