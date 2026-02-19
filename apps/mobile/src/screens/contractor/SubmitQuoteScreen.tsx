import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getProject, mapApiError, submitQuote } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/EmptyState';
import { useAppStore } from '../../store/appStore';
import type { HomeStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';
import { getLocalizedProjectTitle } from '../../utils/localizedProject';

type Props = NativeStackScreenProps<HomeStackParamList, 'SubmitQuote'>;
type BannerState = { kind: 'success' | 'error'; message: string } | null;

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseUsdToCents(value: string): number {
  const numeric = Number(value.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }
  return Math.round(numeric * 100);
}

export function SubmitQuoteScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const user = useAppStore((s) => s.user);
  const language = useAppStore((s) => s.language);
  const projectId = route.params.projectId;
  const [priceInput, setPriceInput] = React.useState('');
  const [timelineInput, setTimelineInput] = React.useState('');
  const [scopeNotes, setScopeNotes] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [statusBanner, setStatusBanner] = React.useState<BannerState>(null);

  const projectQuery = useQuery({
    queryKey: ['project', projectId, 'submit-quote'],
    queryFn: () => getProject({ projectId }),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: { priceCents: number; timelineDays: number; scopeNotes: string }) =>
      submitQuote({
        projectId,
        priceCents: payload.priceCents,
        timelineDays: payload.timelineDays,
        scopeNotes: payload.scopeNotes,
      }),
    onSuccess: () => {
      navigation.replace('ProjectDetail', { projectId });
    },
    onError: (error) => {
      setStatusBanner({ kind: 'error', message: mapApiError(error) });
    },
  });

  const project = projectQuery.data?.project;
  const quotes = projectQuery.data?.quotes ?? [];
  const existingQuote = quotes.find((quote) => quote.contractorId === user?.uid);
  const isOpenForQuotes = project?.escrowState === 'OPEN_FOR_QUOTES';

  const validateForm = React.useCallback((): { priceCents: number; timelineDays: number; scopeNotes: string } | null => {
    const priceCents = parseUsdToCents(priceInput);
    if (priceCents <= 0) {
      setFormError(t('quote.invalidPrice'));
      return null;
    }

    const timelineDays = Number.parseInt(timelineInput, 10);
    if (!Number.isFinite(timelineDays) || timelineDays <= 0) {
      setFormError(t('quote.invalidTimeline'));
      return null;
    }

    const normalizedScopeNotes = scopeNotes.trim();
    if (normalizedScopeNotes.length < 10) {
      setFormError(t('quote.scopeRequired'));
      return null;
    }

    setFormError(null);
    return { priceCents, timelineDays, scopeNotes: normalizedScopeNotes };
  }, [priceInput, scopeNotes, t, timelineInput]);

  if (role !== 'contractor') {
    return (
      <ScreenContainer>
        <EmptyState title={t('common.error')} description={t('errors.permissionDenied')} />
      </ScreenContainer>
    );
  }

  if (projectQuery.isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.meta}>{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <ScreenContainer>
        <EmptyState title={t('common.error')} description={t('project.detailsUnavailable')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('quote.submit')}</Text>
      <Text style={styles.meta}>{getLocalizedProjectTitle(project, language)}</Text>

      {statusBanner ? (
        <View
          style={[
            styles.banner,
            statusBanner.kind === 'success' ? styles.bannerSuccess : styles.bannerError,
          ]}
        >
          <Text
            style={[
              styles.bannerText,
              statusBanner.kind === 'success' ? styles.bannerTextSuccess : styles.bannerTextError,
            ]}
          >
            {statusBanner.message}
          </Text>
        </View>
      ) : null}

      {existingQuote ? (
        <Card testID="submit-quote-existing-card">
          <Text style={styles.sectionTitle}>{t('quote.alreadySubmittedTitle')}</Text>
          <Text style={styles.meta}>
            {t('quote.existingSummary', {
              amount: formatUsd(existingQuote.priceCents),
              days: existingQuote.timelineDays,
            })}
          </Text>
          <Text style={styles.meta}>{existingQuote.scopeNotes}</Text>
          <PrimaryButton
            testID="submit-quote-back-project"
            label={t('quote.goBackProject')}
            onPress={() => navigation.replace('ProjectDetail', { projectId })}
          />
        </Card>
      ) : !isOpenForQuotes ? (
        <EmptyState
          title={t('quote.notOpenTitle')}
          description={t('quote.notOpenDescription')}
          ctaLabel={t('quote.goBackProject')}
          onPressCta={() => navigation.replace('ProjectDetail', { projectId })}
          iconName="information-circle-outline"
        />
      ) : (
        <Card testID="submit-quote-form-card" style={styles.formCard}>
          <FormInput
            containerTestID="submit-quote-price-wrap"
            testID="submit-quote-price"
            label={t('quote.price')}
            placeholder={t('quote.pricePlaceholder')}
            value={priceInput}
            onChangeText={setPriceInput}
            keyboardType="decimal-pad"
          />
          <FormInput
            containerTestID="submit-quote-timeline-wrap"
            testID="submit-quote-timeline"
            label={t('quote.timelineDays')}
            placeholder={t('quote.timelinePlaceholder')}
            value={timelineInput}
            onChangeText={setTimelineInput}
            keyboardType="number-pad"
          />
          <FormInput
            containerTestID="submit-quote-scope-wrap"
            testID="submit-quote-scope"
            label={t('quote.scopeNotes')}
            placeholder={t('quote.scopePlaceholder')}
            value={scopeNotes}
            onChangeText={setScopeNotes}
            multiline
            numberOfLines={4}
            style={styles.scopeInput}
          />
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <PrimaryButton
            testID="submit-quote-submit"
            label={submitMutation.isPending ? t('common.loading') : t('quote.submit')}
            disabled={submitMutation.isPending}
            onPress={() => {
              const payload = validateForm();
              if (!payload) {
                return;
              }
              void submitMutation.mutateAsync(payload);
            }}
          />
          <PrimaryButton
            testID="submit-quote-cancel"
            variant="secondary"
            label={t('common.cancel')}
            onPress={() => navigation.replace('ProjectDetail', { projectId })}
          />
        </Card>
      )}
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
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  meta: {
    color: colors.textSecondary,
  },
  formCard: {
    gap: spacing.sm,
  },
  scopeInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
  banner: {
    borderRadius: 10,
    padding: spacing.sm,
    borderWidth: 1,
  },
  bannerSuccess: {
    borderColor: '#5AA86A',
    backgroundColor: '#EEF9F1',
  },
  bannerError: {
    borderColor: colors.danger,
    backgroundColor: '#FDF0F0',
  },
  bannerText: {
    fontWeight: '600',
  },
  bannerTextSuccess: {
    color: '#1F6F35',
  },
  bannerTextError: {
    color: colors.danger,
  },
});
