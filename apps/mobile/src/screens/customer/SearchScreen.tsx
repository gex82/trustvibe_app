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
  const filteredRecommendationItems = recommendationItems.filter((item) =>
    !query.trim() ? true : String(item.contractorId ?? item.id).toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <ScreenContainer style={styles.wrap}>
      <SectionHeader title={t('nav.search')} />
      <SearchBar placeholder={t('project.category')} value={query} onChangeText={setQuery} />

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
                name={String(item.contractorId ?? 'Contractor')}
                rating={4.8}
                municipality={item.reason}
                onPress={() => navigation.navigate('ContractorProfile', { contractorId: item.contractorId ?? item.id })}
              />
            )}
            ListEmptyComponent={<EmptyState title={t('common.noData')} description={t('search.noContractorResults')} />}
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
            renderItem={({ item }) => (
              <ContractorCard
                name={String(item.contractorId ?? item.code)}
                rating={4.9}
                municipality={item.code}
                onPress={() => navigation.navigate('ContractorProfile', { contractorId: item.contractorId ?? undefined })}
              />
            )}
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
