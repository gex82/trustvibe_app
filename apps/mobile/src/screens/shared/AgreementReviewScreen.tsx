import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { acceptAgreement, getProject, mapApiError } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/appStore';
import { getLocalizedProjectDescription, getLocalizedProjectTitle } from '../../utils/localizedProject';

type Props = NativeStackScreenProps<HomeStackParamList, 'AgreementReview'>;

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AgreementReviewScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const language = useAppStore((s) => s.language);
  const projectId = route.params.projectId;
  const [inlineError, setInlineError] = React.useState<string | null>(null);
  const [inlineStatus, setInlineStatus] = React.useState<string | null>(null);
  const demoAutoAdvanceEnabled = __DEV__ && process.env.EXPO_PUBLIC_USE_EMULATORS !== 'false';

  const projectQuery = useQuery({
    queryKey: ['project', projectId, 'agreement'],
    queryFn: () => getProject({ projectId }),
  });

  const acceptMutation = useMutation({
    mutationFn: () =>
      acceptAgreement({
        agreementId: projectId,
        demoAutoAdvance: demoAutoAdvanceEnabled && role === 'customer',
      }),
    onSuccess: async () => {
      setInlineError(null);
      const refreshed = await projectQuery.refetch();
      const nextState = refreshed.data?.project?.escrowState;
      if (nextState === 'AGREEMENT_ACCEPTED') {
        navigation.replace('FundEscrow', { projectId });
        return;
      }
      setInlineStatus(t('agreement.waitingOtherParty'));
    },
    onError: (error) => {
      setInlineStatus(null);
      setInlineError(mapApiError(error));
    },
  });

  if (projectQuery.isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.text}>{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  if (projectQuery.isError || !projectQuery.data?.project) {
    return (
      <ScreenContainer>
        <Text style={styles.text}>{t('common.error')}</Text>
      </ScreenContainer>
    );
  }

  const project = projectQuery.data.project;
  const quotes = projectQuery.data.quotes ?? [];
  const agreement = projectQuery.data.agreement;
  const selectedQuote = quotes.find((quote) => quote.id === project.selectedQuoteId);
  const contractorName = selectedQuote?.contractorName ?? project.contractorId ?? t('project.pendingSelection');
  const priceCents = Number(agreement?.priceCents ?? selectedQuote?.priceCents ?? project.selectedQuotePriceCents ?? 0);
  const timelineDays = Number(agreement?.timelineDays ?? selectedQuote?.timelineDays ?? 0);
  const scopeSummary =
    agreement?.scopeSummary ??
    `${getLocalizedProjectTitle(project, language)} - ${getLocalizedProjectDescription(project, language)}`;
  const policySummary = agreement?.policySummary ?? t('escrow.hold.policy');
  const feeDisclosure = agreement?.feeDisclosure ?? t('agreement.feeDisclosureFallback');

  return (
    <ScreenContainer style={styles.wrap}>
      <Text testID="agreement-review-title" style={styles.title}>{t('agreement.title')}</Text>
      {demoAutoAdvanceEnabled && role === 'customer' ? (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>{t('agreement.demoAutoAdvanceNotice')}</Text>
        </View>
      ) : null}
      {inlineStatus ? (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>{inlineStatus}</Text>
        </View>
      ) : null}
      {inlineError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{inlineError}</Text>
        </View>
      ) : null}
      <ScrollView testID="agreement-review-card" style={styles.card} contentContainerStyle={styles.cardContent}>
        <Text testID="agreement-review-contractor" style={styles.rowLabel}>{t('project.contractorLabel', { contractor: contractorName })}</Text>
        <Text testID="agreement-review-price" style={styles.rowValue}>{`${t('agreement.price')}: ${formatUsd(priceCents)}`}</Text>
        <Text testID="agreement-review-timeline" style={styles.rowValue}>
          {`${t('agreement.timeline')}: ${
            timelineDays > 0 ? t('agreement.timelineDaysValue', { days: timelineDays }) : t('common.notAvailable')
          }`}
        </Text>
        <Text style={styles.sectionLabel}>{t('agreement.scopeSummary')}</Text>
        <Text testID="agreement-review-scope" style={styles.text}>{scopeSummary}</Text>
        <Text style={styles.sectionLabel}>{t('agreement.policySummary')}</Text>
        <Text testID="agreement-review-policy" style={styles.text}>{policySummary}</Text>
        <Text style={styles.sectionLabel}>{t('agreement.feeDisclosure')}</Text>
        <Text testID="agreement-review-fee" style={styles.text}>{feeDisclosure}</Text>
      </ScrollView>
      <PrimaryButton
        testID="agreement-review-accept"
        label={t('agreement.accept')}
        disabled={acceptMutation.isPending}
        onPress={() => void acceptMutation.mutateAsync()}
      />
      <PrimaryButton
        testID="agreement-review-compare-quotes"
        label={t('quote.compare')}
        variant="secondary"
        onPress={() => navigation.replace('QuotesCompare', { projectId })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    maxHeight: 420,
  },
  cardContent: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  rowLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  rowValue: {
    color: colors.textPrimary,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  text: {
    color: colors.textPrimary,
  },
  infoBanner: {
    borderWidth: 1,
    borderColor: colors.navyLight,
    backgroundColor: '#EAF0FB',
    borderRadius: 10,
    padding: spacing.sm,
  },
  infoBannerText: {
    color: colors.navyDark,
    fontWeight: '600',
  },
  errorBanner: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: '#FDF0F0',
    borderRadius: 10,
    padding: spacing.sm,
  },
  errorBannerText: {
    color: colors.danger,
    fontWeight: '600',
  },
});
