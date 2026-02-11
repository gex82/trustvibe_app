import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { createMilestones, fundHold, getProject } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'FundEscrow'>;

export function FundEscrowScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const projectId = route.params.projectId;

  const projectQuery = useQuery({
    queryKey: ['project', projectId, 'fund'],
    queryFn: () => getProject({ projectId }),
  });

  const fundMutation = useMutation({
    mutationFn: () => fundHold({ projectId }),
    onSuccess: () => navigation.replace('ProjectDetail', { projectId }),
    onError: (error) => Alert.alert(t('common.error'), String(error)),
  });

  const milestoneMutation = useMutation({
    mutationFn: () =>
      createMilestones({
        projectId,
        milestones: [
          { title: 'Milestone 1', amountCents: 30000, acceptanceCriteria: 'Initial completion and photos.' },
          { title: 'Milestone 2', amountCents: 40000, acceptanceCriteria: 'Final completion walkthrough.' },
        ],
      }),
    onSuccess: () => Alert.alert(t('common.status'), t('phase2.milestonesCreated')),
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

  const selectedQuote = projectQuery.data.quotes?.find((q) => q.id === projectQuery.data?.project?.selectedQuoteId);
  const total = Number(selectedQuote?.priceCents ?? 0);

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('escrow.fund')}</Text>
      <View style={styles.card}>
        <Text style={styles.text}>{`${t('escrow.total')}: $${(total / 100).toFixed(2)}`}</Text>
        <Text style={styles.text}>{t('escrow.hold.policy')}</Text>
      </View>
      <PrimaryButton label={t('escrow.fund')} disabled={fundMutation.isPending} onPress={() => void fundMutation.mutateAsync()} />
      <PrimaryButton
        label={t('phase2.demoMilestones')}
        variant="secondary"
        disabled={milestoneMutation.isPending}
        onPress={() => void milestoneMutation.mutateAsync()}
      />
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
