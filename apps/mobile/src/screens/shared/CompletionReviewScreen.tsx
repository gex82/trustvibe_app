import React from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { approveRelease, getProject, mapApiError, raiseIssueHold, requestCompletion } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';
import { pickImage, uploadToStorage } from '../../services/upload';
import { getEscrowStateLabel } from '../../utils/escrowState';

type Props = NativeStackScreenProps<HomeStackParamList, 'CompletionReview'>;

export function CompletionReviewScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const user = useAppStore((s) => s.user);
  const projectId = route.params.projectId;
  const [proofUrls, setProofUrls] = React.useState<string[]>([]);

  const projectQuery = useQuery({
    queryKey: ['project', projectId, 'completion'],
    queryFn: () => getProject({ projectId }),
  });

  const requestMutation = useMutation({
    mutationFn: () => requestCompletion({ projectId, proofPhotoUrls: proofUrls }),
    onSuccess: async () => {
      await projectQuery.refetch();
      Alert.alert(t('common.status'), t('phase2.completionRequested'));
    },
    onError: (error) => Alert.alert(t('common.error'), mapApiError(error)),
  });

  const approveMutation = useMutation({
    mutationFn: () => approveRelease({ projectId }),
    onSuccess: () => navigation.replace('ProjectDetail', { projectId }),
    onError: (error) => Alert.alert(t('common.error'), mapApiError(error)),
  });

  const issueMutation = useMutation({
    mutationFn: () => raiseIssueHold({ projectId, reason: t('escrow.raiseIssue') }),
    onSuccess: () => navigation.replace('JointRelease', { projectId }),
    onError: (error) => Alert.alert(t('common.error'), mapApiError(error)),
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
      <Card>
        <Text style={styles.text}>{`${t('common.status')}: ${getEscrowStateLabel(t, state)}`}</Text>
        <Text style={styles.meta}>{t('completion.proofPhotosCount', { count: proofUrls.length })}</Text>
      </Card>
      {role === 'contractor' ? (
        <>
          <PrimaryButton
            testID="completion-upload-proof-photo"
            label={t('completion.uploadProofPhoto')}
            variant="secondary"
            onPress={async () => {
              try {
                if (!user?.uid) {
                  return;
                }
                const localUri = await pickImage();
                if (!localUri) {
                  return;
                }
                const url = await uploadToStorage(localUri, `projects/${projectId}/proof/${Date.now()}-${user.uid}.jpg`);
                setProofUrls((prev) => [url, ...prev]);
              } catch (error) {
                Alert.alert(t('common.error'), mapApiError(error));
              }
            }}
          />
          <PrimaryButton testID="completion-request-completion" label={t('escrow.requestCompletion')} disabled={requestMutation.isPending} onPress={() => void requestMutation.mutateAsync()} />
        </>
      ) : null}
      {role === 'customer' ? (
        <>
          <PrimaryButton testID="completion-approve" label={t('escrow.approveCompletion')} disabled={approveMutation.isPending} onPress={() => void approveMutation.mutateAsync()} />
          <PrimaryButton testID="completion-raise-issue" label={t('escrow.raiseIssue')} variant="danger" disabled={issueMutation.isPending} onPress={() => void issueMutation.mutateAsync()} />
        </>
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
  text: { color: colors.textPrimary },
  meta: { color: colors.textSecondary },
});
