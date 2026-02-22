import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getProject, mapApiError, selectContractor } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'QuotesCompare'>;

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function QuotesCompareScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const projectId = route.params.projectId;

  const projectQuery = useQuery({
    queryKey: ['project', projectId, 'quotes'],
    queryFn: () => getProject({ projectId }),
  });

  const selectMutation = useMutation({
    mutationFn: (quoteId: string) => selectContractor({ projectId, quoteId }),
    onSuccess: () => {
      navigation.replace('AgreementReview', { projectId });
    },
    onError: (error) => {
      Alert.alert(t('common.error'), mapApiError(error));
    },
  });

  if (projectQuery.isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.text}>{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <ScreenContainer>
        <Text style={styles.text}>{t('common.error')}</Text>
      </ScreenContainer>
    );
  }

  const quotes = projectQuery.data.quotes ?? [];

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('quote.compare')}</Text>
      <Text style={styles.subtitle}>{t('project.compareQuotesHint')}</Text>
      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View testID={`quote-card-${item.id}`} style={styles.card}>
            <Text testID={`quote-contractor-${item.id}`} style={styles.contractorName}>{item.contractorName ?? item.contractorId}</Text>
            {typeof item.contractorRatingAvg === 'number' ? (
              <Text testID={`quote-rating-${item.id}`} style={styles.meta}>
                {t('project.contractorRatingSummary', {
                  rating: item.contractorRatingAvg.toFixed(1),
                  reviews: item.contractorReviewCount ?? 0,
                })}
              </Text>
            ) : null}
            <Text testID={`quote-price-${item.id}`} style={styles.text}>{`${t('quote.price')}: ${formatUsd(Number(item.priceCents ?? 0))}`}</Text>
            <Text testID={`quote-timeline-${item.id}`} style={styles.text}>{`${t('quote.timelineDays')}: ${item.timelineDays}`}</Text>
            <Text style={styles.scopeLabel}>{t('quote.scopeNotes')}</Text>
            <Text testID={`quote-scope-${item.id}`} style={styles.text}>{item.scopeNotes}</Text>
            {role === 'customer' ? (
              <PrimaryButton
                testID={`quote-select-${item.id}`}
                label={t('project.selectThisContractor')}
                disabled={selectMutation.isPending}
                onPress={() => {
                  void selectMutation.mutateAsync(item.id);
                }}
              />
            ) : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>{t('quote.noQuotes')}</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  contractorName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
  },
  scopeLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  text: {
    color: colors.textPrimary,
  },
});
