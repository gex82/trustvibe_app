import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import {
  acceptAgreement,
  approveRelease,
  fundHold,
  getProject,
  proposeJointRelease,
  raiseIssueHold,
  requestCompletion,
  selectContractor,
  signJointRelease,
  uploadResolutionDocument,
} from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppStore } from '../../store/appStore';
import type { HomeStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<HomeStackParamList, 'ProjectDetail'>;

export function ProjectDetailScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const projectId = route.params.projectId;

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject({ projectId }),
  });

  const project = projectQuery.data?.project;
  const quotes = projectQuery.data?.quotes ?? [];

  if (!project) {
    return (
      <ScreenContainer>
        <Text style={styles.text}>{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  const refresh = async () => {
    await projectQuery.refetch();
  };

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{project.title}</Text>
      <Text style={styles.text}>{project.description}</Text>
      <Text style={styles.text}>{`${t('common.status')}: ${project.escrowState}`}</Text>
      <Text style={styles.text}>{`${t('profile.municipality')}: ${project.municipality}`}</Text>

      <View style={styles.section}>
        <PrimaryButton label={t('quote.compare')} variant="secondary" onPress={() => navigation.navigate('QuotesCompare', { projectId })} />
        <PrimaryButton label={t('agreement.title')} variant="secondary" onPress={() => navigation.navigate('AgreementReview', { projectId })} />
        <PrimaryButton label={t('escrow.fund')} variant="secondary" onPress={() => navigation.navigate('FundEscrow', { projectId })} />
        <PrimaryButton label={t('escrow.approveCompletion')} variant="secondary" onPress={() => navigation.navigate('CompletionReview', { projectId })} />
        <PrimaryButton label={t('escrow.jointRelease')} variant="secondary" onPress={() => navigation.navigate('JointRelease', { projectId })} />
        <PrimaryButton label={t('escrow.resolutionUpload')} variant="secondary" onPress={() => navigation.navigate('ResolutionSubmission', { projectId })} />
        <PrimaryButton label={t('reviews.submit')} variant="secondary" onPress={() => navigation.navigate('ReviewSubmission', { projectId })} />

        {role === 'customer' && project.escrowState === 'OPEN_FOR_QUOTES' && quotes.length > 0 ? (
          <PrimaryButton
            label={t('project.selectContractor')}
            onPress={async () => {
              try {
                await selectContractor({ projectId, quoteId: quotes[0].id });
                await refresh();
              } catch (error) {
                Alert.alert(t('common.error'), String(error));
              }
            }}
          />
        ) : null}

        {role === 'customer' && project.escrowState === 'CONTRACTOR_SELECTED' ? (
          <PrimaryButton
            label={t('agreement.accept')}
            onPress={async () => {
              try {
                await acceptAgreement({ agreementId: projectId });
                await refresh();
              } catch (error) {
                Alert.alert(t('common.error'), String(error));
              }
            }}
          />
        ) : null}

        {role === 'customer' && project.escrowState === 'AGREEMENT_ACCEPTED' ? (
          <PrimaryButton
            label={t('escrow.fund')}
            onPress={async () => {
              try {
                await fundHold({ projectId });
                await refresh();
              } catch (error) {
                Alert.alert(t('common.error'), String(error));
              }
            }}
          />
        ) : null}

        {role === 'contractor' && project.escrowState === 'FUNDED_HELD' ? (
          <PrimaryButton
            label={t('escrow.requestCompletion')}
            onPress={async () => {
              try {
                await requestCompletion({ projectId });
                await refresh();
              } catch (error) {
                Alert.alert(t('common.error'), String(error));
              }
            }}
          />
        ) : null}

        {role === 'customer' && project.escrowState === 'COMPLETION_REQUESTED' ? (
          <>
            <PrimaryButton
              label={t('escrow.approveCompletion')}
              onPress={async () => {
                try {
                  await approveRelease({ projectId });
                  await refresh();
                } catch (error) {
                  Alert.alert(t('common.error'), String(error));
                }
              }}
            />
            <PrimaryButton
              label={t('escrow.raiseIssue')}
              variant="danger"
              onPress={async () => {
                try {
                  await raiseIssueHold({ projectId, reason: t('escrow.raiseIssue') });
                  await refresh();
                } catch (error) {
                  Alert.alert(t('common.error'), String(error));
                }
              }}
            />
          </>
        ) : null}

        {project.escrowState === 'ISSUE_RAISED_HOLD' ? (
          <>
            <PrimaryButton
              label={t('escrow.jointRelease')}
              onPress={async () => {
                try {
                  const heldAmount = Number(project.heldAmountCents ?? 0);
                  const proposal = await proposeJointRelease({
                    projectId,
                    releaseToContractorCents: Math.floor(heldAmount * 0.7),
                    refundToCustomerCents: heldAmount - Math.floor(heldAmount * 0.7),
                  });
                  await signJointRelease({ projectId, proposalId: proposal.proposalId });
                  await refresh();
                } catch (error) {
                  Alert.alert(t('common.error'), String(error));
                }
              }}
            />
            <PrimaryButton
              label={t('escrow.resolutionUpload')}
              variant="secondary"
              onPress={async () => {
                try {
                  await uploadResolutionDocument({
                    projectId,
                    documentUrl: 'https://example.com/resolution.pdf',
                    resolutionType: 'signed_settlement',
                    summary: t('escrow.jointRelease'),
                  });
                  await refresh();
                } catch (error) {
                  Alert.alert(t('common.error'), String(error));
                }
              }}
            />
          </>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  text: {
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
