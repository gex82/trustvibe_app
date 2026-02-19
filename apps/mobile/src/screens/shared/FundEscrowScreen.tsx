import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { createMilestones, fundHold, getProject, mapApiError } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { CTAButton } from '../../components/CTAButton';
import { EmptyState } from '../../components/EmptyState';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'FundEscrow'>;
type BannerState = {
  kind: 'success' | 'error';
  message: string;
} | null;

export function FundEscrowScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const featureFlags = useAppStore((s) => s.featureFlags);
  const projectId = route.params.projectId;
  const [busy, setBusy] = React.useState(false);
  const [statusBanner, setStatusBanner] = React.useState<BannerState>(null);

  const projectQuery = useQuery({
    queryKey: ['project', projectId, 'fund'],
    queryFn: () => getProject({ projectId }),
  });

  if (projectQuery.isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.meta}>{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  if (!projectQuery.data?.project) {
    return (
      <ScreenContainer>
        <EmptyState title={t('common.error')} description={t('fundEscrow.loadError')} />
      </ScreenContainer>
    );
  }

  const project = projectQuery.data.project;
  const selectedQuote = projectQuery.data.quotes?.find((q) => q.id === project.selectedQuoteId);
  const total = Number(selectedQuote?.priceCents ?? project.selectedQuotePriceCents ?? 0);

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('escrow.fund')}</Text>
      <Card>
        <Text style={styles.amount}>{`$${(total / 100).toLocaleString()}`}</Text>
        <Text style={styles.meta}>{t('escrow.hold.policy')}</Text>
      </Card>

      {statusBanner ? (
        <View style={[styles.banner, statusBanner.kind === 'success' ? styles.bannerSuccess : styles.bannerError]}>
          <Text style={[styles.bannerText, statusBanner.kind === 'success' ? styles.bannerTextSuccess : styles.bannerTextError]}>
            {statusBanner.message}
          </Text>
        </View>
      ) : null}

      <CTAButton
        label={t('escrow.fund')}
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          try {
            await fundHold({ projectId });
            navigation.replace('ProjectDetail', { projectId });
          } catch (error) {
            Alert.alert(t('common.error'), mapApiError(error));
          } finally {
            setBusy(false);
          }
        }}
      />

      {featureFlags.milestonePaymentsEnabled ? (
        <CTAButton
          label={t('phase2.demoMilestones')}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await createMilestones({
                projectId,
                milestones: [
                  { title: t('fundEscrow.milestone1Title'), amountCents: Math.floor(total * 0.5), acceptanceCriteria: t('fundEscrow.milestone1Criteria') },
                  { title: t('fundEscrow.milestone2Title'), amountCents: Math.ceil(total * 0.5), acceptanceCriteria: t('fundEscrow.milestone2Criteria') },
                ],
              });
              setStatusBanner({ kind: 'success', message: t('phase2.milestonesCreated') });
            } catch (error) {
              setStatusBanner({ kind: 'error', message: mapApiError(error) });
            } finally {
              setBusy(false);
            }
          }}
          style={styles.secondaryAction}
        />
      ) : (
        <View style={styles.flagBox}>
          <Text style={styles.meta}>{t('fundEscrow.milestonesDisabled')}</Text>
        </View>
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
  amount: {
    color: colors.navy,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  meta: {
    color: colors.textSecondary,
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
  flagBox: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.sm,
  },
  secondaryAction: {
    backgroundColor: colors.backgroundSecondary,
  },
});
