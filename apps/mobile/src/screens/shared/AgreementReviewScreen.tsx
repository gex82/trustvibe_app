import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { acceptAgreement, getProject, mapApiError } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';
import { getEscrowStateLabel } from '../../utils/escrowState';
import { useAppStore } from '../../store/appStore';
import { getLocalizedProjectTitle } from '../../utils/localizedProject';

type Props = NativeStackScreenProps<HomeStackParamList, 'AgreementReview'>;

export function AgreementReviewScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const projectId = route.params.projectId;

  const projectQuery = useQuery({
    queryKey: ['project', projectId, 'agreement'],
    queryFn: () => getProject({ projectId }),
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptAgreement({ agreementId: projectId }),
    onSuccess: async () => {
      const refreshed = await projectQuery.refetch();
      const nextState = refreshed.data?.project?.escrowState;
      if (nextState === 'AGREEMENT_ACCEPTED') {
        navigation.replace('FundEscrow', { projectId });
      } else {
        Alert.alert(t('common.status'), t('agreement.waitingOtherParty'));
      }
    },
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

  const project = projectQuery.data.project;

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('agreement.title')}</Text>
      <View style={styles.card}>
        <Text style={styles.text}>{`${t('agreement.scopeSummary')}: ${getLocalizedProjectTitle(project, language)}`}</Text>
        <Text style={styles.text}>{`${t('agreement.policySummary')}: ${t('escrow.hold.policy')}`}</Text>
        <Text style={styles.text}>{`${t('common.status')}: ${getEscrowStateLabel(t, project.escrowState)}`}</Text>
      </View>
      <PrimaryButton label={t('agreement.accept')} disabled={acceptMutation.isPending} onPress={() => void acceptMutation.mutateAsync()} />
      <PrimaryButton label={t('quote.compare')} variant="secondary" onPress={() => navigation.replace('QuotesCompare', { projectId })} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
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
  text: { color: colors.textPrimary },
});
