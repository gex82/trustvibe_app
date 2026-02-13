import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { listProjects, mapApiError } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ProjectCard } from '../../components/ProjectCard';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { HomeStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';
import { getEscrowStateLabel } from '../../utils/escrowState';

type Props = NativeStackScreenProps<HomeStackParamList, 'ProjectsList'>;

function deriveProgress(escrowState: string): number {
  switch (escrowState) {
    case 'OPEN_FOR_QUOTES':
      return 10;
    case 'CONTRACTOR_SELECTED':
    case 'AGREEMENT_ACCEPTED':
      return 30;
    case 'FUNDED_HELD':
      return 45;
    case 'COMPLETION_REQUESTED':
      return 80;
    case 'RELEASED_PAID':
    case 'EXECUTED_RELEASE_FULL':
      return 100;
    default:
      return 55;
  }
}

export function ProjectsListScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const projectsQuery = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => listProjects({ limit: 50 }),
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('nav.projects')}</Text>
      <PrimaryButton label={t('project.create.title')} onPress={() => navigation.navigate('CreateProject')} />

      {projectsQuery.isError ? <Text style={styles.error}>{mapApiError(projectsQuery.error)}</Text> : null}

      <FlatList
        data={projectsQuery.data?.projects ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProjectCard
            title={String(item.title)}
            phaseLabel={getEscrowStateLabel(t, String(item.escrowState))}
            progress={deriveProgress(String(item.escrowState))}
            onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
          />
        )}
        ListEmptyComponent={
          projectsQuery.isLoading ? (
            <Text style={styles.meta}>{t('common.loading')}</Text>
          ) : (
            <EmptyState
              title={t('home.noActiveProjectsTitle')}
              description={t('projects.emptyDescription')}
              ctaLabel={t('project.create.title')}
              onPressCta={() => navigation.navigate('CreateProject')}
            />
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  meta: {
    color: colors.textSecondary,
  },
  error: {
    color: colors.danger,
  },
});
