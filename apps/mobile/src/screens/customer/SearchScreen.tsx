import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getRecommendations, listFeaturedListings, mapApiError } from '../../services/api';
import type { HomeStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SearchBar } from '../../components/SearchBar';
import { ContractorCard } from '../../components/ContractorCard';
import { EmptyState } from '../../components/EmptyState';
import { SectionHeader } from '../../components/SectionHeader';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';
import { getFeaturedBusinessName, resolveContractorDisplayName } from '../../utils/contractorDisplay';

type Props = NativeStackScreenProps<HomeStackParamList, 'Search'>;

export function SearchScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState('');
  const role = useAppStore((s) => s.role) ?? 'customer';
  const featureFlags = useAppStore((s) => s.featureFlags);

  const recommendationsQuery = useQuery({
    queryKey: ['search-recommendations', role],
    queryFn: () => getRecommendations({ target: 'customer', limit: 20 }),
    enabled: featureFlags.recommendationsEnabled,
  });

  const featuredQuery = useQuery({
    queryKey: ['search-featured'],
    queryFn: () => listFeaturedListings({ limit: 20 }),
    enabled: featureFlags.growthEnabled,
  });

  const recommendationItems = recommendationsQuery.data?.recommendations ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRecommendationItems = recommendationItems.filter((item) => {
    if (!normalizedQuery) {
      return true;
    }
    const searchable = [item.contractorName, item.contractorId, item.reason, item.id].filter(Boolean).join(' ').toLowerCase();
    return searchable.includes(normalizedQuery);
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <SectionHeader title={t('nav.search')} />
      <SearchBar
        containerTestID="search-query"
        testID="search-query-input"
        placeholder={t('project.category')}
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.section}>
        <Text style={styles.heading}>{t('search.recommendedContractors')}</Text>
        {!featureFlags.recommendationsEnabled ? (
          <EmptyState title={t('search.recommendationsDisabledTitle')} description={t('search.recommendationsDisabledDescription')} iconName="information-circle-outline" />
        ) : recommendationsQuery.isError ? (
          <EmptyState title={t('common.error')} description={mapApiError(recommendationsQuery.error)} iconName="alert-circle-outline" />
        ) : (
          <FlatList
            data={filteredRecommendationItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ContractorCard
                testID={`search-recommended-contractor-${item.id}`}
                name={resolveContractorDisplayName(item.contractorName, item.contractorId ?? item.id, t)}
                rating={item.contractorRatingAvg ?? 4.8}
                municipality={item.reason}
                avatarUri={item.contractorAvatarUrl ?? null}
                onPress={() => navigation.navigate('ContractorProfile', { contractorId: item.contractorId ?? item.id })}
              />
            )}
            ListEmptyComponent={
              role === 'customer' ? (
                <ContractorCard
                  testID="search-fallback-contractor"
                  name="Juan's Services"
                  rating={4.9}
                  municipality="San Juan"
                  avatarUri={null}
                  onPress={() => navigation.navigate('ContractorProfile', { contractorId: 'contractor-001' })}
                />
              ) : (
                <EmptyState title={t('common.noData')} description={t('search.noContractorResults')} />
              )
            }
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>{t('phase2.featuredListings')}</Text>
        {!featureFlags.growthEnabled ? (
          <EmptyState title={t('search.featuredDisabledTitle')} description={t('search.featuredDisabledDescription')} iconName="sparkles-outline" />
        ) : featuredQuery.isError ? (
          <EmptyState title={t('common.error')} description={mapApiError(featuredQuery.error)} iconName="alert-circle-outline" />
        ) : (
          <FlatList
            data={featuredQuery.data?.featured ?? []}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const featuredContractorId = typeof item.contractorId === 'string' ? item.contractorId : undefined;
              const featuredProfileName = getFeaturedBusinessName(item.contractorProfile);
              return (
              <ContractorCard
                testID={`search-featured-contractor-${item.code}`}
                name={resolveContractorDisplayName(featuredProfileName, featuredContractorId, t)}
                rating={4.9}
                municipality={item.code}
                onPress={featuredContractorId ? () => navigation.navigate('ContractorProfile', { contractorId: featuredContractorId }) : undefined}
              />
              );
            }}
            ListEmptyComponent={<EmptyState title={t('common.noData')} description={t('search.noFeaturedListings')} />}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
});
