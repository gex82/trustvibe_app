import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { applyReferralCode, getRecommendations, listFeaturedListings, mapApiError } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/EmptyState';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';

export function RecommendationsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role) ?? 'customer';
  const recommendationTarget = role === 'contractor' ? 'contractor' : 'customer';
  const featureFlags = useAppStore((s) => s.featureFlags);
  const [code, setCode] = React.useState('');

  const recommendationsQuery = useQuery({
    queryKey: ['recommendations', recommendationTarget],
    queryFn: () => getRecommendations({ target: recommendationTarget }),
    enabled: featureFlags.recommendationsEnabled,
  });

  const featuredQuery = useQuery({
    queryKey: ['featured-listings'],
    queryFn: () => listFeaturedListings({ limit: 10 }),
    enabled: featureFlags.growthEnabled,
  });

  const referralMutation = useMutation({
    mutationFn: () => applyReferralCode({ code }),
    onSuccess: () => {
      setCode('');
      Alert.alert(t('common.status'), t('phase2.codeApplied'));
    },
    onError: (error) => Alert.alert(t('common.error'), mapApiError(error)),
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('phase2.recommendationsTitle')}</Text>

      {!featureFlags.recommendationsEnabled ? (
        <EmptyState title={t('recommendations.disabledTitle')} description={t('recommendations.disabledDescription')} />
      ) : (
        <FlatList
          data={recommendationsQuery.data?.recommendations ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.text}>{item.reason}</Text>
              <Text style={styles.muted}>{item.contractorId ?? item.projectId ?? item.id}</Text>
            </Card>
          )}
          ListEmptyComponent={
            recommendationsQuery.isLoading ? (
              <Text style={styles.muted}>{t('common.loading')}</Text>
            ) : recommendationsQuery.isError ? (
              <Text style={styles.error}>{mapApiError(recommendationsQuery.error)}</Text>
            ) : (
              <EmptyState title={t('phase2.noRecommendations')} description={t('recommendations.noRecommendationsDescription')} />
            )
          }
        />
      )}

      <Text style={styles.subtitle}>{t('phase2.featuredListings')}</Text>
      {!featureFlags.growthEnabled ? (
        <EmptyState title={t('recommendations.featuredDisabledTitle')} description={t('recommendations.featuredDisabledDescription')} />
      ) : (
        <FlatList
          data={featuredQuery.data?.featured ?? []}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.text}>{item.code}</Text>
              <Text style={styles.muted}>{item.contractorId ?? t('common.notAvailable')}</Text>
            </Card>
          )}
          ListEmptyComponent={
            featuredQuery.isLoading ? (
              <Text style={styles.muted}>{t('common.loading')}</Text>
            ) : featuredQuery.isError ? (
              <Text style={styles.error}>{mapApiError(featuredQuery.error)}</Text>
            ) : (
              <EmptyState title={t('phase2.noFeatured')} description={t('recommendations.noFeaturedDescription')} />
            )
          }
        />
      )}

      {featureFlags.growthEnabled ? (
        <View style={styles.referralWrap}>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder={t('phase2.referralCode')}
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
          <PrimaryButton
            label={t('phase2.applyReferral')}
            disabled={!code.trim() || referralMutation.isPending}
            onPress={() => void referralMutation.mutateAsync()}
          />
        </View>
      ) : null}
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
  subtitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  text: { color: colors.textPrimary },
  muted: { color: colors.textSecondary },
  error: { color: colors.danger },
  referralWrap: {
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
