import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { applyReferralCode, getRecommendations, listFeaturedListings, mapApiError } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/EmptyState';
import { useAppStore } from '../../store/appStore';
import type { HomeStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';
import { formatContractorFallbackName, resolveContractorDisplayName } from '../../utils/contractorDisplay';

type Props = NativeStackScreenProps<HomeStackParamList, 'Recommendations'>;

export function RecommendationsScreen({ navigation }: Props): React.JSX.Element {
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
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const contractorId = item.type === 'contractor' ? item.contractorId ?? item.id : undefined;
            const projectId = item.type === 'project' ? item.projectId ?? item.id : undefined;
            const isActionable = Boolean(contractorId || projectId);
            const actionLabel = !isActionable
              ? t('recommendations.itemUnavailable')
              : item.type === 'contractor'
              ? t('recommendations.openContractorProfile')
              : t('recommendations.openProject');
            const title =
              item.type === 'contractor'
                ? resolveContractorDisplayName(item.contractorName, contractorId, t)
                : item.projectTitle ?? projectId ?? t('recommendations.unknownProject');

            return (
              <Pressable
                testID={`recommendations-item-${item.id}`}
                disabled={!isActionable}
                onPress={() => {
                  if (contractorId) {
                    navigation.navigate('ContractorProfile', { contractorId });
                    return;
                  }
                  if (projectId) {
                    navigation.navigate('ProjectDetail', { projectId });
                  }
                }}
                style={({ pressed }) => [
                  styles.pressable,
                  !isActionable ? styles.pressableDisabled : null,
                  pressed && isActionable ? styles.pressablePressed : null,
                ]}
              >
                <Card>
                  <Text style={styles.itemTitle}>{title}</Text>
                  <Text style={styles.text}>{item.reason}</Text>
                  <Text style={isActionable ? styles.linkText : styles.muted}>{actionLabel}</Text>
                </Card>
              </Pressable>
            );
          }}
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
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const contractorId = typeof item.contractorId === 'string' ? item.contractorId : undefined;
            const contractorName = formatContractorFallbackName(contractorId, t);
            const actionLabel = contractorId ? t('recommendations.openContractorProfile') : t('recommendations.itemUnavailable');
            return (
              <Pressable
                testID={`featured-item-${item.code}`}
                disabled={!contractorId}
                onPress={contractorId ? () => navigation.navigate('ContractorProfile', { contractorId }) : undefined}
                style={({ pressed }) => [
                  styles.pressable,
                  !contractorId ? styles.pressableDisabled : null,
                  pressed && contractorId ? styles.pressablePressed : null,
                ]}
              >
                <Card>
                  <Text style={styles.itemTitle}>{contractorName}</Text>
                  <Text style={styles.text}>{item.code}</Text>
                  <Text style={contractorId ? styles.linkText : styles.muted}>{actionLabel}</Text>
                </Card>
              </Pressable>
            );
          }}
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
  list: { gap: spacing.sm },
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
  pressable: {
    borderRadius: 14,
  },
  pressableDisabled: {
    opacity: 0.65,
  },
  pressablePressed: {
    opacity: 0.75,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  text: { color: colors.textPrimary },
  linkText: {
    color: colors.navy,
    marginTop: spacing.xs,
    fontWeight: '700',
  },
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
