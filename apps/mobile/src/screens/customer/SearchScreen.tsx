import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { FilterChips } from '../../components/FilterChips';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';
import { getFeaturedBusinessName, resolveContractorDisplayName } from '../../utils/contractorDisplay';
import { demoContractorAvatarById } from '../../assets/demoAssets';

type Props = NativeStackScreenProps<HomeStackParamList, 'Search'>;

type SearchFilters = {
  category?: string;
  municipality?: string;
  minRating?: number;
};

const CATEGORY_FILTER_VALUES = ['plumbing', 'electrical', 'painting', 'carpentry', 'roofing', 'general'] as const;
const MUNICIPALITY_FILTER_VALUES = ['San Juan', 'Bayamon', 'Carolina', 'Ponce', 'Caguas'] as const;
const RATING_FILTER_VALUES = [4, 3] as const;

function toRecommendationFilterPayload(filters: SearchFilters): { category?: string; municipality?: string } {
  return {
    category: filters.category,
    municipality: filters.municipality,
  };
}

function parseFeaturedMetadata(contractorProfile: unknown): {
  skills: string[];
  municipalities: string[];
  ratingAvg?: number;
} {
  if (!contractorProfile || typeof contractorProfile !== 'object') {
    return { skills: [], municipalities: [] };
  }
  const data = contractorProfile as Record<string, unknown>;
  const skills = Array.isArray(data.skills) ? data.skills.map((entry) => String(entry).toLowerCase()) : [];
  const municipalities = Array.isArray(data.serviceMunicipalities)
    ? data.serviceMunicipalities.map((entry) => String(entry))
    : [];
  const ratingAvg = typeof data.ratingAvg === 'number' && Number.isFinite(data.ratingAvg) ? data.ratingAvg : undefined;
  return { skills, municipalities, ratingAvg };
}

function parseRecommendationCategory(reason: string | undefined): string | undefined {
  if (!reason) {
    return undefined;
  }
  const normalized = reason.toLowerCase();
  return CATEGORY_FILTER_VALUES.find((value) => normalized.includes(value));
}

function parseRecommendationMunicipality(reason: string | undefined): string | undefined {
  if (!reason) {
    return undefined;
  }
  return MUNICIPALITY_FILTER_VALUES.find((value) => reason.toLowerCase().includes(value.toLowerCase()));
}

export function SearchScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<SearchFilters>({});
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
  const resolveAvatarSource = React.useCallback(
    (contractorId: string | undefined) => (contractorId ? demoContractorAvatarById[contractorId] : undefined),
    []
  );

  const recommendationFilterPayload = React.useMemo(() => toRecommendationFilterPayload(filters), [filters]);
  const hasActiveFilters = Boolean(filters.category || filters.municipality || filters.minRating);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredRecommendationItems = recommendationItems.filter((item) => {
    const searchable = [item.contractorName, item.contractorId, item.reason, item.id].filter(Boolean).join(' ').toLowerCase();
    if (normalizedQuery && !searchable.includes(normalizedQuery)) {
      return false;
    }

    if (recommendationFilterPayload.category) {
      const category = parseRecommendationCategory(item.reason);
      if (!category || category !== recommendationFilterPayload.category) {
        return false;
      }
    }

    if (recommendationFilterPayload.municipality) {
      const municipality = parseRecommendationMunicipality(item.reason);
      if (!municipality || municipality !== recommendationFilterPayload.municipality) {
        return false;
      }
    }

    if (filters.minRating) {
      if (typeof item.contractorRatingAvg !== 'number' || item.contractorRatingAvg < filters.minRating) {
        return false;
      }
    }

    return true;
  });

  const filteredFeaturedItems = (featuredQuery.data?.featured ?? []).filter((item) => {
    const metadata = parseFeaturedMetadata(item.contractorProfile);
    const searchable = [item.code, item.contractorId, getFeaturedBusinessName(item.contractorProfile)].filter(Boolean).join(' ').toLowerCase();
    if (normalizedQuery && !searchable.includes(normalizedQuery)) {
      return false;
    }

    if (recommendationFilterPayload.category) {
      if (!metadata.skills.length || !metadata.skills.includes(recommendationFilterPayload.category.toLowerCase())) {
        return false;
      }
    }

    if (recommendationFilterPayload.municipality) {
      if (!metadata.municipalities.length || !metadata.municipalities.includes(recommendationFilterPayload.municipality)) {
        return false;
      }
    }

    if (filters.minRating) {
      if (typeof metadata.ratingAvg !== 'number' || metadata.ratingAvg < filters.minRating) {
        return false;
      }
    }

    return true;
  });

  const categoryFilters = CATEGORY_FILTER_VALUES.map((value) => ({
    value,
    label: t(`project.category.${value}`),
    active: filters.category === value,
  }));
  const municipalityFilters = MUNICIPALITY_FILTER_VALUES.map((value) => ({
    value,
    label: value,
    active: filters.municipality === value,
  }));
  const ratingFilters = RATING_FILTER_VALUES.map((value) => ({
    value: String(value),
    label: t('search.minRating', { stars: value }),
    active: filters.minRating === value,
  }));

  const toggleCategory = React.useCallback((value: string) => {
    setFilters((current) => ({ ...current, category: current.category === value ? undefined : value }));
  }, []);

  const toggleMunicipality = React.useCallback((value: string) => {
    setFilters((current) => ({ ...current, municipality: current.municipality === value ? undefined : value }));
  }, []);

  const toggleRating = React.useCallback((value: string) => {
    setFilters((current) => ({
      ...current,
      minRating: current.minRating === Number(value) ? undefined : Number(value),
    }));
  }, []);

  const clearFilters = React.useCallback(() => setFilters({}), []);

  const fallbackSearchCard = !hasActiveFilters && role === 'customer' ? (
    <ContractorCard
      testID="search-fallback-contractor"
      name="Juan's Services"
      rating={4.9}
      municipality="San Juan"
      avatarSource={resolveAvatarSource('contractor-001')}
      avatarUri={null}
      onPress={() => navigation.navigate('ContractorProfile', { contractorId: 'contractor-001' })}
    />
  ) : (
    <EmptyState title={t('common.noData')} description={t('search.noContractorResults')} />
  );

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

      <View style={styles.filtersBlock}>
        <View style={styles.filtersHeader}>
          <Text style={styles.heading}>{t('search.filters')}</Text>
          {hasActiveFilters ? (
            <Pressable testID="search-clear-filters" onPress={clearFilters}>
              <Text style={styles.clearLink}>{t('search.clearFilters')}</Text>
            </Pressable>
          ) : null}
        </View>
        <FilterChips testIDPrefix="search-filter-category" filters={categoryFilters} onToggle={toggleCategory} />
        <FilterChips testIDPrefix="search-filter-municipality" filters={municipalityFilters} onToggle={toggleMunicipality} />
        <FilterChips testIDPrefix="search-filter-rating" filters={ratingFilters} onToggle={toggleRating} />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>{t('search.recommendedContractors')}</Text>
        {!featureFlags.recommendationsEnabled ? (
          <EmptyState
            title={t('search.recommendationsDisabledTitle')}
            description={t('search.recommendationsDisabledDescription')}
            iconName="information-circle-outline"
          />
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
                avatarSource={resolveAvatarSource(item.contractorId ?? item.id)}
                avatarUri={item.contractorAvatarUrl ?? null}
                onPress={() => navigation.navigate('ContractorProfile', { contractorId: item.contractorId ?? item.id })}
              />
            )}
            ListEmptyComponent={fallbackSearchCard}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>{t('phase2.featuredListings')}</Text>
        {!featureFlags.growthEnabled ? (
          <EmptyState
            title={t('search.featuredDisabledTitle')}
            description={t('search.featuredDisabledDescription')}
            iconName="sparkles-outline"
          />
        ) : featuredQuery.isError ? (
          <EmptyState title={t('common.error')} description={mapApiError(featuredQuery.error)} iconName="alert-circle-outline" />
        ) : (
          <FlatList
            data={filteredFeaturedItems}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const featuredContractorId = typeof item.contractorId === 'string' ? item.contractorId : undefined;
              const featuredProfileName = getFeaturedBusinessName(item.contractorProfile);
              const featuredMetadata = parseFeaturedMetadata(item.contractorProfile);
              return (
                <ContractorCard
                  testID={`search-featured-contractor-${item.code}`}
                  name={resolveContractorDisplayName(featuredProfileName, featuredContractorId, t)}
                  rating={featuredMetadata.ratingAvg ?? 4.9}
                  municipality={featuredMetadata.municipalities[0] ?? item.code}
                  avatarSource={resolveAvatarSource(featuredContractorId)}
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
  filtersBlock: {
    gap: spacing.xs,
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearLink: {
    color: colors.navyLight,
    fontSize: 12,
    fontWeight: '700',
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

