import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type { CallableResponse, ProjectRecord } from '@trustvibe/shared';
import {
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
  previewEstimateDeposit,
  proposeJointRelease,
  raiseIssueHold,
  refundEstimateDeposit,
  requestCompletion,
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
type GetProjectResponse = CallableResponse<'getProject'>;
type ProjectMilestone = NonNullable<ProjectRecord['milestones']>[number];
type QuoteView = GetProjectResponse['quotes'][number];
type EstimateDepositView = NonNullable<GetProjectResponse['estimateDeposit']>;
type ActionKey = 'createEstimateDeposit' | 'createBookingRequest' | 'generic';
type BannerState = {
  kind: 'success' | 'error' | 'info';
  message: string;
} | null;

type MilestoneItem = {
  id: string;
  title: string;
  amountCents: number;
  status: 'completed' | 'in_progress' | 'held';
};

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toMilestoneStatus(status?: ProjectMilestone['status']): MilestoneItem['status'] {
  if (status === 'APPROVED' || status === 'RELEASED') {
    return 'completed';
  }
  if (status === 'COMPLETED_REQUESTED') {
    return 'held';
  }
  return 'in_progress';
}

function buildMilestones(project: ProjectRecord, t: Translate): MilestoneItem[] {
  if (Array.isArray(project.milestones) && project.milestones.length > 0) {
    return project.milestones.map((milestone) => ({
      id: String(milestone.id),
      title: String(milestone.title),
      amountCents: Number(milestone.amountCents ?? 0),
      status: toMilestoneStatus(milestone.status),
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

function getContractorDisplayName(project: ProjectRecord, selectedQuote: QuoteView | undefined, t: Translate): string {
  if (selectedQuote?.contractorName) {
    return selectedQuote.contractorName;
  }
  if (project.contractorId) {
    return `${t('project.selectedContractorFallback')} (${project.contractorId})`;
  }
  return t('project.pendingSelection');
}

function isDepositCaptured(deposit: EstimateDepositView | undefined): boolean {
  if (!deposit) {
    return false;
  }
  return ['CAPTURED', 'CONTRACTOR_ATTENDED', 'CUSTOMER_ATTENDED'].includes(deposit.status);
}

function resolveActionError(action: ActionKey, error: unknown, t: Translate): string {
  const rawMessage = String((error as { message?: string })?.message ?? '');
  if (action === 'createEstimateDeposit' && rawMessage.includes('Contractor must be selected for estimate deposit')) {
    return t('project.errorDepositNeedsContractor');
  }
  if (action === 'createBookingRequest' && rawMessage.includes('Estimate deposit must be captured before booking')) {
    return t('project.errorBookingNeedsCapturedDeposit');
  }
  if (action === 'createBookingRequest' && rawMessage.includes('Contractor must be selected before booking')) {
    return t('project.errorBookingNeedsContractor');
  }
  return mapApiError(error);
}

function agreementStatusLabel(payload: GetProjectResponse, t: Translate): string {
  const agreement = payload.agreement;
  if (!agreement) {
    return t('project.agreementNotReady');
  }
  if (agreement.acceptedByCustomerAt && agreement.acceptedByContractorAt) {
    return t('project.agreementAcceptedBoth');
  }
  if (agreement.acceptedByCustomerAt || agreement.acceptedByContractorAt) {
    return t('project.agreementAcceptedOneParty');
  }
  return t('project.agreementPendingAcceptance');
}

export function ProjectDetailScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const language = useAppStore((s) => s.language);
  const featureFlags = useAppStore((s) => s.featureFlags);
  const projectId = route.params.projectId;
  const [busy, setBusy] = React.useState(false);
  const [statusBanner, setStatusBanner] = React.useState<BannerState>(null);
  const [showDeveloperActions, setShowDeveloperActions] = React.useState(false);

  const projectQuery = useQuery<GetProjectResponse>({
    queryKey: ['project', projectId],
    queryFn: () => getProject({ projectId }),
  });

  const project = projectQuery.data?.project;
  const quotes = projectQuery.data?.quotes ?? [];
  const agreement = projectQuery.data?.agreement;
  const estimateDeposit = projectQuery.data?.estimateDeposit;

  async function runAction(action: () => Promise<unknown>, actionKey: ActionKey, successMessage?: string): Promise<void> {
    setBusy(true);
    try {
      await action();
      if (successMessage) {
        setStatusBanner({ kind: 'success', message: successMessage });
      }
      await projectQuery.refetch();
    } catch (error) {
      setStatusBanner({ kind: 'error', message: resolveActionError(actionKey, error, t) });
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

  if (!project || !projectQuery.data) {
    return (
      <ScreenContainer>
        <EmptyState title={t('common.error')} description={t('project.detailsUnavailable')} iconName="alert-circle-outline" />
      </ScreenContainer>
    );
  }

  const milestones = buildMilestones(project, t);
  const selectedQuote = quotes.find((quote) => quote.id === project.selectedQuoteId);
  const contractorName = getContractorDisplayName(project, selectedQuote, t);
  const quoteAmount = Number(selectedQuote?.priceCents ?? project.selectedQuotePriceCents ?? project.heldAmountCents ?? 0);
  const nextMilestone = milestones.find((item) => item.status !== 'completed');
  const hasAnyAdvancedFlag =
    featureFlags.estimateDepositsEnabled ||
    featureFlags.milestonePaymentsEnabled ||
    featureFlags.changeOrdersEnabled ||
    featureFlags.credentialVerificationEnabled ||
    featureFlags.highTicketConciergeEnabled ||
    featureFlags.reliabilityScoringEnabled ||
    featureFlags.stripeConnectEnabled ||
    featureFlags.schedulingEnabled;
  const bookingDisabledReason = !project.contractorId
    ? t('project.disabledNeedsContractor')
    : !estimateDeposit
    ? t('project.disabledNeedsDeposit')
    : !isDepositCaptured(estimateDeposit)
    ? t('project.disabledNeedsCapturedDeposit')
    : null;

  async function previewAndConfirmEstimateDeposit(): Promise<void> {
    if (!project.contractorId) {
      setStatusBanner({ kind: 'error', message: t('project.errorDepositNeedsContractor') });
      return;
    }
    setBusy(true);
    try {
      const preview = await previewEstimateDeposit({ projectId, category: project.category });
      setBusy(false);
      Alert.alert(
        t('project.depositConfirmTitle'),
        t('project.depositConfirmBody', {
          amount: formatUsd(preview.amountCents),
          rationale: preview.rationale,
        }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('project.depositConfirmAction'),
            onPress: () => {
              void runAction(
                () => createEstimateDeposit({ projectId }),
                'createEstimateDeposit',
                t('project.depositCreatedDetailed', { amount: formatUsd(preview.amountCents) })
              );
            },
          },
        ]
      );
    } catch (error) {
      setStatusBanner({ kind: 'error', message: resolveActionError('createEstimateDeposit', error, t) });
      setBusy(false);
    }
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.title}>{getLocalizedProjectTitle(project, language)}</Text>
        <Text style={styles.meta}>{getLocalizedProjectDescription(project, language)}</Text>
        <View style={styles.contractorRow}>
          <Text style={styles.contractorLabel}>{t('project.contractorLabel', { contractor: contractorName })}</Text>
          <Badge label={t('contractor.verifiedPro')} />
        </View>

        <Card>
          <Text style={styles.amount}>{formatUsd(quoteAmount)}</Text>
          <Text style={styles.meta}>{t('project.statusValue', { status: getEscrowStateLabel(t, project.escrowState) })}</Text>
          <Text style={styles.meta}>{project.municipality}</Text>
        </Card>

        <Card testID="project-detail-workflow-card">
          <Text style={styles.sectionMeta}>{t('project.workflowStatusTitle')}</Text>
          <Text testID="project-detail-workflow-state" style={styles.meta}>
            {t('project.workflowCurrentState', { status: getEscrowStateLabel(t, project.escrowState) })}
          </Text>
          <Text testID="project-detail-workflow-contractor" style={styles.meta}>
            {t('project.workflowContractor', { contractor: contractorName })}
          </Text>
          <Text testID="project-detail-workflow-quote-amount" style={styles.meta}>
            {t('project.workflowQuoteAmount', { amount: formatUsd(Number(selectedQuote?.priceCents ?? quoteAmount)) })}
          </Text>
          <Text testID="project-detail-workflow-timeline" style={styles.meta}>
            {t('project.workflowTimeline', {
              timeline:
                Number(selectedQuote?.timelineDays ?? agreement?.timelineDays ?? 0) > 0
                  ? t('agreement.timelineDaysValue', {
                      days: Number(selectedQuote?.timelineDays ?? agreement?.timelineDays ?? 0),
                    })
                  : t('common.notAvailable'),
            })}
          </Text>
          <Text testID="project-detail-workflow-agreement" style={styles.meta}>
            {t('project.workflowAgreement', { status: agreementStatusLabel(projectQuery.data, t) })}
          </Text>
        </Card>

        {statusBanner ? (
          <View
            testID="project-detail-status-banner"
            style={[
              styles.banner,
              statusBanner.kind === 'success'
                ? styles.bannerSuccess
                : statusBanner.kind === 'error'
                ? styles.bannerError
                : styles.bannerInfo,
            ]}
          >
            <Text
              testID="project-detail-status-banner-text"
              style={[
                styles.bannerText,
                statusBanner.kind === 'success'
                  ? styles.bannerTextSuccess
                  : statusBanner.kind === 'error'
                  ? styles.bannerTextError
                  : styles.bannerTextInfo,
              ]}
            >
              {statusBanner.message}
            </Text>
          </View>
        ) : null}

        <SectionHeader title={t('project.milestoneLedger')} />
        {milestones.map((milestone) => (
          <MilestoneRow
            key={milestone.id}
            title={milestone.title}
            subtitle={formatUsd(milestone.amountCents)}
            status={milestone.status}
          />
        ))}

        <View style={styles.ctaWrap}>
          {role === 'customer' && project.escrowState === 'OPEN_FOR_QUOTES' ? (
            <CTAButton
              testID="project-detail-select-contractor"
              label={t('project.selectContractor')}
              onPress={() => navigation.navigate('QuotesCompare', { projectId })}
              disabled={busy || quotes.length === 0}
            />
          ) : null}

          {role === 'customer' && project.escrowState === 'CONTRACTOR_SELECTED' ? (
            <CTAButton
              testID="project-detail-review-agreement"
              label={t('project.reviewAgreement')}
              onPress={() => navigation.navigate('AgreementReview', { projectId })}
              disabled={busy}
            />
          ) : null}

          {role === 'customer' && project.escrowState === 'AGREEMENT_ACCEPTED' ? (
            <CTAButton
              testID="project-detail-fund-escrow"
              label={t('escrow.fund')}
              onPress={() => navigation.navigate('FundEscrow', { projectId })}
              disabled={busy}
            />
          ) : null}

          {role === 'contractor' && project.escrowState === 'FUNDED_HELD' ? (
            <CTAButton
              testID="project-detail-request-completion"
              label={t('escrow.requestCompletion')}
              onPress={() => void runAction(() => requestCompletion({ projectId }), 'generic', t('phase2.completionRequested'))}
              disabled={busy}
            />
          ) : null}

          {role === 'customer' && project.escrowState === 'COMPLETION_REQUESTED' && nextMilestone ? (
            <CTAButton
              testID="project-detail-review-release"
              label={t('project.reviewAndRelease', { amount: formatUsd(nextMilestone.amountCents) })}
              iconName="lock-closed-outline"
              onPress={() => void runAction(() => approveRelease({ projectId }), 'generic', t('project.fundsReleased'))}
              disabled={busy}
            />
          ) : null}

          {role === 'customer' && project.escrowState === 'COMPLETION_REQUESTED' ? (
            <CTAButton
              testID="project-detail-raise-issue"
              label={t('escrow.raiseIssue')}
              onPress={() => void runAction(() => raiseIssueHold({ projectId, reason: t('escrow.raiseIssue') }), 'generic')}
              disabled={busy}
            />
          ) : null}

          <CTAButton
            testID="project-detail-open-messages"
            label={t('project.openMessages')}
            onPress={() => navigation.navigate('Messages')}
            disabled={busy}
          />
        </View>

        {estimateDeposit ? (
          <Card testID="project-detail-deposit-card">
            <Text style={styles.sectionMeta}>{t('project.depositDetailsTitle')}</Text>
            <Text testID="project-detail-deposit-amount" style={styles.meta}>
              {t('project.depositAmount', { amount: formatUsd(estimateDeposit.amountCents) })}
            </Text>
            <Text testID="project-detail-deposit-status" style={styles.meta}>
              {t('project.depositStatus', {
                status: t(`project.depositStatusValue.${estimateDeposit.status}`),
              })}
            </Text>
            <Text testID="project-detail-deposit-updated-at" style={styles.meta}>
              {t('project.depositUpdatedAt', { timestamp: estimateDeposit.updatedAt })}
            </Text>
          </Card>
        ) : null}

        <SectionHeader title={t('project.advancedActions')} />
        {!hasAnyAdvancedFlag ? (
          <EmptyState
            title={t('project.advancedDisabledTitle')}
            description={t('project.advancedDisabledDescription')}
            iconName="settings-outline"
          />
        ) : (
          <Card>
            <Pressable
              testID="project-detail-toggle-developer-actions"
              style={styles.developerToggle}
              onPress={() => setShowDeveloperActions((current) => !current)}
            >
              <Text style={styles.developerToggleTitle}>
                {showDeveloperActions ? t('project.developerActionsHide') : t('project.developerActionsShow')}
              </Text>
              <Text style={styles.developerToggleMeta}>
                {showDeveloperActions ? t('project.developerActionsCollapseHint') : t('project.developerActionsExpandHint')}
              </Text>
            </Pressable>

            {showDeveloperActions ? (
              <View style={styles.developerActionsWrap}>
                {role === 'customer' && featureFlags.estimateDepositsEnabled ? (
                  <View style={styles.actionGroup}>
                    <Text style={styles.sectionMeta}>{t('project.estimateDepositFlow')}</Text>
                    <CTAButton
                      testID="project-detail-create-estimate-deposit"
                      label={t('phase2.createEstimateDeposit')}
                      onPress={() => void previewAndConfirmEstimateDeposit()}
                      disabled={busy || !project.contractorId}
                    />
                    {!project.contractorId ? <Text style={styles.disabledReason}>{t('project.disabledNeedsContractor')}</Text> : null}
                    {estimateDeposit ? (
                      <CTAButton
                        testID="project-detail-capture-estimate-deposit"
                        label={t('phase2.captureEstimateDeposit')}
                        onPress={() =>
                          void runAction(
                            () => captureEstimateDeposit({ depositId: estimateDeposit.id }),
                            'generic',
                            t('project.depositCaptured')
                          )
                        }
                        disabled={busy || estimateDeposit.status !== 'CREATED'}
                      />
                    ) : null}
                    {estimateDeposit && estimateDeposit.status !== 'CREATED' ? (
                      <Text style={styles.disabledReason}>{t('project.captureUnavailableReason')}</Text>
                    ) : null}
                    {estimateDeposit ? (
                      <CTAButton
                        testID="project-detail-apply-estimate-deposit"
                        label={t('phase2.applyDepositToJob')}
                        onPress={() =>
                          void runAction(
                            () => applyEstimateDepositToJob({ projectId, depositId: estimateDeposit.id }),
                            'generic',
                            t('project.depositCreditApplied')
                          )
                        }
                        disabled={busy || !isDepositCaptured(estimateDeposit)}
                      />
                    ) : null}
                    {estimateDeposit && !isDepositCaptured(estimateDeposit) ? (
                      <Text style={styles.disabledReason}>{t('project.disabledNeedsCapturedDeposit')}</Text>
                    ) : null}
                    {estimateDeposit ? (
                      <CTAButton
                        testID="project-detail-refund-estimate-deposit"
                        label={t('phase2.refundEstimateDeposit')}
                        onPress={() =>
                          void runAction(
                            () => refundEstimateDeposit({ depositId: estimateDeposit.id, reason: t('project.demoRefundReason') }),
                            'generic',
                            t('project.depositRefunded')
                          )
                        }
                        disabled={busy || estimateDeposit.status === 'REFUNDED'}
                      />
                    ) : null}
                  </View>
                ) : null}

                {role === 'customer' && featureFlags.schedulingEnabled ? (
                  <View style={styles.actionGroup}>
                    <CTAButton
                      label={t('phase2.createBookingRequest')}
                      onPress={() =>
                        void runAction(
                          () =>
                            createBookingRequest({
                              projectId,
                              estimateDepositId: estimateDeposit?.id,
                              startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                              endAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
                              note: t('project.bookingNote'),
                            }),
                          'createBookingRequest',
                          t('project.bookingRequestCreated')
                        )
                      }
                      disabled={busy || Boolean(bookingDisabledReason)}
                    />
                    {bookingDisabledReason ? <Text style={styles.disabledReason}>{bookingDisabledReason}</Text> : null}
                  </View>
                ) : null}

                {role === 'contractor' && featureFlags.reliabilityScoringEnabled && estimateDeposit ? (
                  <CTAButton
                    label={t('phase2.markEstimateAttended')}
                    onPress={() =>
                      void runAction(
                        () =>
                          markEstimateAttendance({
                            depositId: estimateDeposit.id,
                            attendance: 'contractor_present',
                          }),
                        'generic',
                        t('project.attendanceRecorded')
                      )
                    }
                    disabled={busy}
                  />
                ) : null}

                {role === 'contractor' && featureFlags.stripeConnectEnabled ? (
                  <CTAButton
                    label={t('phase2.startPayoutOnboarding')}
                    onPress={() =>
                      void runAction(
                        async () => {
                          await createConnectedPaymentAccount({});
                          const onboarding = await getPaymentOnboardingLink({});
                          setStatusBanner({
                            kind: 'info',
                            message: `${t('phase2.onboardingLinkTitle')}: ${onboarding.onboardingUrl}`,
                          });
                        },
                        'generic'
                      )
                    }
                    disabled={busy}
                  />
                ) : null}

                {role === 'contractor' && featureFlags.credentialVerificationEnabled ? (
                  <CTAButton
                    label={t('phase2.submitDacoCredential')}
                    onPress={() =>
                      void runAction(
                        () =>
                          submitCredentialForVerification({
                            credentialType: 'daco_registration',
                            identifier: 'DACO-PR-1001',
                          }),
                        'generic',
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
                      void runAction(
                        async () => {
                          const score = await getReliabilityScore({});
                          setStatusBanner({
                            kind: 'info',
                            message: t('project.reliabilityScoreSummary', {
                              score: Number(score.score.score ?? 0).toFixed(2),
                            }),
                          });
                        },
                        'generic'
                      )
                    }
                    disabled={busy}
                  />
                ) : null}

                {role === 'customer' && project.highTicket && featureFlags.highTicketConciergeEnabled ? (
                  <CTAButton
                    label={t('phase2.createConciergeCase')}
                    onPress={() =>
                      void runAction(
                        () =>
                          createHighTicketCase({
                            projectId,
                            intakeNotes: t('phase2.highTicketIntakeDefault'),
                          }),
                        'generic',
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
                      void runAction(
                        async () => {
                          const held = Number(project.heldAmountCents ?? 0);
                          const releaseToContractorCents = Math.floor(held * 0.7);
                          const refundToCustomerCents = held - releaseToContractorCents;
                          const proposal = await proposeJointRelease({
                            projectId,
                            releaseToContractorCents,
                            refundToCustomerCents,
                          });
                          await signJointRelease({ projectId, proposalId: proposal.proposalId });
                        },
                        'generic'
                      )
                    }
                    disabled={busy}
                  />
                ) : null}
              </View>
            ) : null}
          </Card>
        )}
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
    flex: 1,
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
    marginBottom: spacing.xs,
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
  bannerInfo: {
    borderColor: colors.navyLight,
    backgroundColor: '#EAF0FB',
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
  bannerTextInfo: {
    color: colors.navyDark,
  },
  developerToggle: {
    gap: spacing.xxs,
  },
  developerToggleTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  developerToggleMeta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  developerActionsWrap: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionGroup: {
    gap: spacing.xs,
  },
  disabledReason: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
