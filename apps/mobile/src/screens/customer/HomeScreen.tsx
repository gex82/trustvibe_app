import React from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { listProjects, logout, mapApiError } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SearchBar } from '../../components/SearchBar';
import { FinancialCard } from '../../components/FinancialCard';
import { ProjectCard } from '../../components/ProjectCard';
import { SectionHeader } from '../../components/SectionHeader';
import { EmptyState } from '../../components/EmptyState';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import type { HomeStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';
import { getEscrowStateLabel } from '../../utils/escrowState';
import { getLocalizedProjectTitle } from '../../utils/localizedProject';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

function deriveProgress(escrowState: string): number {
  switch (escrowState) {
    case 'OPEN_FOR_QUOTES':
      return 15;
    case 'CONTRACTOR_SELECTED':
    case 'AGREEMENT_ACCEPTED':
      return 35;
    case 'FUNDED_HELD':
      return 55;
    case 'COMPLETION_REQUESTED':
      return 80;
    case 'RELEASED_PAID':
    case 'EXECUTED_RELEASE_FULL':
      return 100;
    default:
      return 45;
  }
}

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const profile = useAppStore((s) => s.profile);
  const language = useAppStore((s) => s.language);
  const projectsQuery = useQuery({
    queryKey: ['home-projects'],
    queryFn: () => listProjects({ limit: 20 }),
  });

  const projects = React.useMemo(
    () => projectsQuery.data?.projects ?? [],
    [projectsQuery.data?.projects]
  );
  const activeProjects = React.useMemo(
    () => projects.filter((item) => !['RELEASED_PAID', 'EXECUTED_RELEASE_FULL', 'EXECUTED_REFUND_FULL'].includes(String(item.escrowState))),
    [projects]
  );
  const escrowTotalCents = React.useMemo(
    () => activeProjects.reduce((sum, item) => sum + Number(item.heldAmountCents ?? item.selectedQuotePriceCents ?? 0), 0),
    [activeProjects]
  );

  const navigateToTab = React.useCallback((tabName: 'SearchTab' | 'ProjectsTab') => {
    navigation.getParent()?.navigate(tabName);
  }, [navigation]);

  const handleActivityPress = React.useCallback(
    (projectId: string) => navigation.navigate('ProjectDetail', { projectId }),
    [navigation]
  );

  async function performLogout(): Promise<void> {
    try {
      await logout();
    } catch (error) {
      Alert.alert(t('common.error'), mapApiError(error));
    }
  }

  function handleLogout(): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm(`${t('home.logoutConfirmTitle')}\n\n${t('home.logoutConfirmBody')}`);
      if (!confirmed) {
        return;
      }
      void performLogout();
      return;
    }

    Alert.alert(t('home.logoutConfirmTitle'), t('home.logoutConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('home.logoutConfirmAction'),
        style: 'destructive',
        onPress: () => void performLogout(),
      },
    ]);
  }

  return (
    <ScreenContainer style={styles.wrap}>
      <View style={styles.top}>
        <Text style={styles.greeting}>{t('home.greeting', { name: profile?.name?.split(' ')[0] ?? t('home.greetingFallbackName') })}</Text>
        <View style={styles.topActions}>
          <LanguageSwitcher compact testIDPrefix="home-language" />
          <Pressable testID="home-quick-logout" onPress={handleLogout}>
            <Text style={styles.logoutText}>{t('home.logout')}</Text>
          </Pressable>
        </View>
      </View>

      <SearchBar
        containerTestID="home-search"
        testID="home-search-input"
        value=""
        editable={false}
        placeholder={t('home.searchPlaceholder')}
        onFocus={() => navigateToTab('SearchTab')}
        onPressIn={() => navigateToTab('SearchTab')}
      />

      <View>
        <SectionHeader title={t('home.financialOverview')} />
        <FinancialCard totalCents={escrowTotalCents} />
      </View>

      <View style={styles.projectsSection}>
        <SectionHeader title={t('home.activeProjects')} actionLabel={t('home.seeAll')} onPressAction={() => navigateToTab('ProjectsTab')} />
        <FlatList
          horizontal
          data={activeProjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.projectList}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProjectCard
              testID={`home-project-card-${item.id}`}
              title={getLocalizedProjectTitle(item, language)}
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
                description={t('home.noActiveProjectsDescription')}
                ctaLabel={t('project.create.title')}
                onPressCta={() => navigation.navigate('CreateProject')}
              />
            )
          }
        />
      </View>

      <View style={styles.activitySection}>
        <SectionHeader title={t('home.recentActivity')} />
        {activeProjects.slice(0, 3).map((item) => (
          <Pressable
            key={item.id}
            testID={`home-activity-${item.id}`}
            onPress={() => handleActivityPress(item.id)}
            style={({ pressed }) => [styles.activityRow, pressed ? styles.activityRowPressed : null]}
          >
            <Text style={styles.activityTitle}>{getLocalizedProjectTitle(item, language)}</Text>
            <Text style={styles.activityMeta}>{getEscrowStateLabel(t, String(item.escrowState))}</Text>
          </Pressable>
        ))}
        {!activeProjects.length && !projectsQuery.isLoading ? (
          <Text style={styles.meta}>{t('common.noData')}</Text>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  topActions: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    flex: 1,
    marginRight: spacing.sm,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  projectsSection: {
    gap: spacing.xs,
  },
  projectList: {
    gap: spacing.sm,
  },
  activitySection: {
    gap: spacing.sm,
  },
  activityRow: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  activityRowPressed: {
    opacity: 0.75,
  },
  activityTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  activityMeta: {
    color: colors.textSecondary,
  },
  meta: {
    color: colors.textSecondary,
  },
});
