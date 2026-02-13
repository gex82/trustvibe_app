import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import {
  acceptAgreement,
  applyEstimateDepositToJob,
  approveRelease,
  captureEstimateDeposit,
  createBookingRequest,
  createConnectedPaymentAccount,
  createEstimateDeposit,
  createHighTicketCase,
  fundHold,
  getPaymentOnboardingLink,
  getProject,
  getReliabilityScore,
  mapApiError,
  markEstimateAttendance,
  proposeJointRelease,
  raiseIssueHold,
  refundEstimateDeposit,
  requestCompletion,
  selectContractor,
  signJointRelease,
  submitCredentialForVerification,
} from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { SectionHeader } from '../../components/SectionHeader';
import { MilestoneRow } from '../../components/MilestoneRow';
import { CTAButton } from '../../components/CTAButton';
import { EmptyState } from '../../components/EmptyState';
import { useAppStore } from '../../store/appStore';
import type { HomeStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';
import { getEscrowStateLabel } from '../../utils/escrowState';
import { getLocalizedProjectDescription, getLocalizedProjectTitle } from '../../utils/localizedProject';

type Props = NativeStackScreenProps<HomeStackParamList, 'ProjectDetail'>;
type Translate = (key: string, options?: Record<string, unknown>) => string;

type MilestoneItem = {
  id: string;
  title: string;
  amountCents: number;
  status: 'completed' | 'in_progress' | 'held';
};

function buildMilestones(project: any, t: Translate): MilestoneItem[] {
  if (Array.isArray(project.milestones) && project.milestones.length) {
    return project.milestones.map((milestone: any) => ({
      id: String(milestone.id),
      title: String(milestone.title),
      amountCents: Number(milestone.amountCents ?? 0),
      status:
        milestone.status === 'APPROVED'
          ? 'completed'
          : milestone.status === 'COMPLETED_REQUESTED'
          ? 'held'
          : 'in_progress',
    }));
  }

  return [
    {
      id: 'm1',
      title: t('project.defaultMilestone1'),
      amountCents: Number(project.heldAmountCents ?? project.selectedQuotePriceCents ?? 0) * 0.5,
      status: ['RELEASED_PAID', 'EXECUTED_RELEASE_FULL', 'EXECUTED_RELEASE_PARTIAL'].includes(String(project.escrowState))
        ? 'completed'
        : 'in_progress',
    },
    {
      id: 'm2',
      title: t('project.defaultMilestone2'),
      amountCents: Number(project.heldAmountCents ?? project.selectedQuotePriceCents ?? 0) * 0.5,
      status: String(project.escrowState).includes('ISSUE') ? 'held' : 'in_progress',
    },
  ];
}

export function ProjectDetailScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const language = useAppStore((s) => s.language);
  const featureFlags = useAppStore((s) => s.featureFlags);
  const projectId = route.params.projectId;
  const [busy, setBusy] = React.useState(false);

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject({ projectId }),
  });

  const project = projectQuery.data?.project;
  const quotes = projectQuery.data?.quotes ?? [];

  async function runAction(action: () => Promise<unknown>, successMessage?: string): Promise<void> {
    setBusy(true);
    try {
      await action();
      if (successMessage) {
        Alert.alert(t('common.status'), successMessage);
      }
      await projectQuery.refetch();
    } catch (error) {
      Alert.alert(t('common.error'), mapApiError(error));
    } finally {
      setBusy(false);
    }
  }

  if (projectQuery.isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.meta}>{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  if (!project) {
    return (
      <ScreenContainer>
        <EmptyState title={t('common.error')} description={t('project.detailsUnavailable')} iconName="alert-circle-outline" />
      </ScreenContainer>
    );
  }

  const milestones = buildMilestones(project, t);
  const selectedQuote = quotes.find((q) => q.id === project.selectedQuoteId);
  const quoteAmount = Number(selectedQuote?.priceCents ?? project.selectedQuotePriceCents ?? project.heldAmountCents ?? 0);
  const nextMilestone = milestones.find((item) => item.status !== 'completed');

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.title}>{getLocalizedProjectTitle(project, language)}</Text>
        <Text style={styles.meta}>{getLocalizedProjectDescription(project, language)}</Text>
        <View style={styles.contractorRow}>
          <Text style={styles.contractorLabel}>{t('project.contractorLabel', { contractor: project.contractorId ?? t('project.pendingSelection') })}</Text>
          <Badge label={t('contractor.verifiedPro')} />
        </View>

        <Card>
          <Text style={styles.amount}>{`$${(quoteAmount / 100).toLocaleString()}`}</Text>
          <Text style={styles.meta}>{t('project.statusValue', { status: getEscrowStateLabel(t, project.escrowState) })}</Text>
          <Text style={styles.meta}>{project.municipality}</Text>
        </Card>

        <SectionHeader title={t('project.milestoneLedger')} />
        {milestones.map((milestone) => (
          <MilestoneRow
            key={milestone.id}
            title={milestone.title}
            subtitle={`$${(milestone.amountCents / 100).toLocaleString()}`}
            status={milestone.status}
          />
        ))}

        <View style={styles.ctaWrap}>
          {role === 'customer' && project.escrowState === 'OPEN_FOR_QUOTES' && quotes.length > 0 ? (
            <CTAButton
              testID="project-detail-select-contractor"
              label={t('project.selectContractor')}
              onPress={() =>
                runAction(
                  () => selectContractor({ projectId, quoteId: quotes[0].id }),
                  t('project.contractorSelected')
                )
              }
              disabled={busy}
            />
          ) : null}

          {role === 'customer' && project.escrowState === 'CONTRACTOR_SELECTED' ? (
            <CTAButton
              testID="project-detail-accept-agreement"
              label={t('agreement.accept')}
              onPress={() => runAction(() => acceptAgreement({ agreementId: projectId }), t('project.agreementAccepted'))}
              disabled={busy}
            />
          ) : null}

          {role === 'customer' && project.escrowState === 'AGREEMENT_ACCEPTED' ? (
            <CTAButton
              testID="project-detail-fund-escrow"
              label={t('escrow.fund')}
              onPress={() => runAction(() => fundHold({ projectId }), t('project.escrowFunded'))}
              disabled={busy}
            />
          ) : null}

          {role === 'contractor' && project.escrowState === 'FUNDED_HELD' ? (
            <CTAButton
              testID="project-detail-request-completion"
              label={t('escrow.requestCompletion')}
              onPress={() => runAction(() => requestCompletion({ projectId }), t('phase2.completionRequested'))}
              disabled={busy}
            />
          ) : null}

          {role === 'customer' && project.escrowState === 'COMPLETION_REQUESTED' && nextMilestone ? (
            <CTAButton
              testID="project-detail-review-release"
              label={t('project.reviewAndRelease', { amount: `$${(nextMilestone.amountCents / 100).toLocaleString()}` })}
              iconName="lock-closed-outline"
              onPress={() => runAction(() => approveRelease({ projectId }), t('project.fundsReleased'))}
              disabled={busy}
            />
          ) : null}

          {role === 'customer' && project.escrowState === 'COMPLETION_REQUESTED' ? (
            <CTAButton
              testID="project-detail-raise-issue"
              label={t('escrow.raiseIssue')}
              onPress={() => runAction(() => raiseIssueHold({ projectId, reason: t('escrow.raiseIssue') }))}
              disabled={busy}
            />
          ) : null}
        </View>

        <SectionHeader title={t('project.advancedActions')} />
        {!featureFlags.estimateDepositsEnabled &&
        !featureFlags.milestonePaymentsEnabled &&
        !featureFlags.changeOrdersEnabled &&
        !featureFlags.credentialVerificationEnabled &&
        !featureFlags.highTicketConciergeEnabled &&
        !featureFlags.reliabilityScoringEnabled &&
        !featureFlags.stripeConnectEnabled &&
        !featureFlags.schedulingEnabled ? (
          <EmptyState title={t('project.advancedDisabledTitle')} description={t('project.advancedDisabledDescription')} iconName="settings-outline" />
        ) : null}

        {role === 'customer' && featureFlags.estimateDepositsEnabled && project.contractorId ? (
          <Card>
            <Text style={styles.sectionMeta}>{t('project.estimateDepositFlow')}</Text>
            <CTAButton label={t('phase2.createEstimateDeposit')} onPress={() => runAction(() => createEstimateDeposit({ projectId }), t('project.depositCreated'))} disabled={busy} />
            {project.estimateDepositId ? (
              <CTAButton label={t('phase2.captureEstimateDeposit')} onPress={() => runAction(() => captureEstimateDeposit({ depositId: project.estimateDepositId }), t('project.depositCaptured'))} disabled={busy} />
            ) : null}
            {project.estimateDepositId ? (
              <CTAButton label={t('phase2.applyDepositToJob')} onPress={() => runAction(() => applyEstimateDepositToJob({ projectId, depositId: project.estimateDepositId }), t('project.depositCreditApplied'))} disabled={busy} />
            ) : null}
            {project.estimateDepositId ? (
              <CTAButton label={t('phase2.refundEstimateDeposit')} onPress={() => runAction(() => refundEstimateDeposit({ depositId: project.estimateDepositId, reason: t('project.demoRefundReason') }), t('project.depositRefunded'))} disabled={busy} />
            ) : null}
          </Card>
        ) : null}

        {role === 'customer' && featureFlags.schedulingEnabled && project.estimateDepositId ? (
          <CTAButton
            label={t('phase2.createBookingRequest')}
            onPress={() =>
              runAction(() =>
                createBookingRequest({
                  projectId,
                  estimateDepositId: project.estimateDepositId,
                  startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  endAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
                  note: t('project.bookingNote'),
                })
              )
            }
            disabled={busy}
          />
        ) : null}

        {role === 'contractor' && featureFlags.reliabilityScoringEnabled && project.estimateDepositId ? (
          <CTAButton label={t('phase2.markEstimateAttended')} onPress={() => runAction(() => markEstimateAttendance({ depositId: project.estimateDepositId, attendance: 'contractor_present' }), t('project.attendanceRecorded'))} disabled={busy} />
        ) : null}

        {role === 'contractor' && featureFlags.stripeConnectEnabled ? (
          <CTAButton
            label={t('phase2.startPayoutOnboarding')}
            onPress={() =>
              runAction(async () => {
                await createConnectedPaymentAccount({});
                const onboarding = await getPaymentOnboardingLink({});
                Alert.alert(t('phase2.onboardingLinkTitle'), onboarding.onboardingUrl);
              })
            }
            disabled={busy}
          />
        ) : null}

        {role === 'contractor' && featureFlags.credentialVerificationEnabled ? (
          <CTAButton
            label={t('phase2.submitDacoCredential')}
            onPress={() =>
              runAction(
                () =>
                  submitCredentialForVerification({
                    credentialType: 'daco_registration',
                    identifier: 'DACO-PR-1001',
                  }),
                t('phase2.credentialSubmitted')
              )
            }
            disabled={busy}
          />
        ) : null}

        {role === 'contractor' && featureFlags.reliabilityScoringEnabled ? (
          <CTAButton
            label={t('phase2.viewReliabilityScore')}
            onPress={() =>
              runAction(async () => {
                const score = await getReliabilityScore({});
                Alert.alert(t('phase2.reliabilityTitle'), JSON.stringify(score.score, null, 2));
              })
            }
            disabled={busy}
          />
        ) : null}

        {role === 'customer' && project.highTicket && featureFlags.highTicketConciergeEnabled ? (
          <CTAButton
            label={t('phase2.createConciergeCase')}
            onPress={() =>
              runAction(
                () =>
                  createHighTicketCase({
                    projectId,
                    intakeNotes: t('phase2.highTicketIntakeDefault'),
                  }),
                t('project.conciergeCreated')
              )
            }
            disabled={busy}
          />
        ) : null}

        {project.escrowState === 'ISSUE_RAISED_HOLD' ? (
          <CTAButton
            label={t('project.proposeAndSignJointRelease')}
            onPress={() =>
              runAction(async () => {
                const held = Number(project.heldAmountCents ?? 0);
                const releaseToContractorCents = Math.floor(held * 0.7);
                const refundToCustomerCents = held - releaseToContractorCents;
                const proposal = await proposeJointRelease({
                  projectId,
                  releaseToContractorCents,
                  refundToCustomerCents,
                });
                await signJointRelease({ projectId, proposalId: proposal.proposalId });
              })
            }
            disabled={busy}
          />
        ) : null}

        <CTAButton testID="project-detail-open-messages" label={t('project.openMessages')} onPress={() => navigation.navigate('Messages')} disabled={busy} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '800',
  },
  contractorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  contractorLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    color: colors.navy,
    fontSize: 42,
    fontWeight: '800',
  },
  meta: {
    color: colors.textSecondary,
  },
  ctaWrap: {
    gap: spacing.sm,
  },
  sectionMeta: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
});
