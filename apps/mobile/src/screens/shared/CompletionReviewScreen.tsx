import React from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { approveRelease, getProject, raiseIssueHold, requestCompletion } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'CompletionReview'>;

export function CompletionReviewScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const projectId = route.params.projectId;

  const projectQuery = useQuery({
    queryKey: ['project', projectId, 'completion'],
    queryFn: () => getProject({ projectId }),
  });

  const requestMutation = useMutation({
    mutationFn: () => requestCompletion({ projectId }),
    onSuccess: async () => {
      await projectQuery.refetch();
      Alert.alert(t('common.status'), t('phase2.completionRequested'));
    },
    onError: (error) => Alert.alert(t('common.error'), String(error)),
  });

  const approveMutation = useMutation({
    mutationFn: () => approveRelease({ projectId }),
    onSuccess: () => navigation.replace('ProjectDetail', { projectId }),
    onError: (error) => Alert.alert(t('common.error'), String(error)),
  });

  const issueMutation = useMutation({
    mutationFn: () => raiseIssueHold({ projectId, reason: t('escrow.raiseIssue') }),
    onSuccess: () => navigation.replace('JointRelease', { projectId }),
    onError: (error) => Alert.alert(t('common.error'), String(error)),
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

  const state = projectQuery.data.project.escrowState;

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('escrow.approveCompletion')}</Text>
      <Text style={styles.text}>{`${t('common.status')}: ${state}`}</Text>
      {role === 'contractor' ? (
        <PrimaryButton label={t('escrow.requestCompletion')} disabled={requestMutation.isPending} onPress={() => void requestMutation.mutateAsync()} />
      ) : null}
      {role === 'customer' ? (
        <>
          <PrimaryButton label={t('escrow.approveCompletion')} disabled={approveMutation.isPending} onPress={() => void approveMutation.mutateAsync()} />
          <PrimaryButton label={t('escrow.raiseIssue')} variant="danger" disabled={issueMutation.isPending} onPress={() => void issueMutation.mutateAsync()} />
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  text: { color: colors.textPrimary },
});
