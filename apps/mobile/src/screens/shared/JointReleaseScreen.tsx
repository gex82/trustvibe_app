import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getProject, proposeJointRelease, signJointRelease } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'JointRelease'>;

export function JointReleaseScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const projectId = route.params.projectId;
  const [contractorAmount, setContractorAmount] = React.useState('0');
  const [proposalId, setProposalId] = React.useState<string | null>(null);

  const projectQuery = useQuery({
    queryKey: ['project', projectId, 'joint-release'],
    queryFn: () => getProject({ projectId }),
  });

  React.useEffect(() => {
    const held = Number(projectQuery.data?.project?.heldAmountCents ?? 0);
    if (held > 0 && Number(contractorAmount) <= 0) {
      setContractorAmount(String(Math.floor(held * 0.7)));
    }
  }, [contractorAmount, projectQuery.data?.project?.heldAmountCents]);

  const proposeMutation = useMutation({
    mutationFn: async () => {
      const held = Number(projectQuery.data?.project?.heldAmountCents ?? 0);
      const releaseToContractorCents = Number(contractorAmount);
      return proposeJointRelease({
        projectId,
        releaseToContractorCents,
        refundToCustomerCents: Math.max(held - releaseToContractorCents, 0),
      });
    },
    onSuccess: async (result) => {
      setProposalId(result.proposalId);
      await signJointRelease({ projectId, proposalId: result.proposalId });
      Alert.alert(t('common.status'), t('phase2.jointReleaseProposedSigned'));
      navigation.replace('ProjectDetail', { projectId });
    },
    onError: (error) => Alert.alert(t('common.error'), String(error)),
  });

  const signMutation = useMutation({
    mutationFn: () => {
      if (!proposalId) {
        throw new Error('No proposal available to sign.');
      }
      return signJointRelease({ projectId, proposalId });
    },
    onSuccess: () => {
      Alert.alert(t('common.status'), t('phase2.jointReleaseSigned'));
      navigation.replace('ProjectDetail', { projectId });
    },
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

  const heldAmount = Number(projectQuery.data.project.heldAmountCents ?? 0);
  const customerRefund = Math.max(heldAmount - Number(contractorAmount), 0);

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('escrow.jointRelease')}</Text>
      <View style={styles.card}>
        <Text style={styles.text}>{`${t('escrow.total')}: $${(heldAmount / 100).toFixed(2)}`}</Text>
        <Text style={styles.text}>{t('phase2.releaseToContractorCents')}</Text>
        <TextInput value={contractorAmount} onChangeText={setContractorAmount} keyboardType="numeric" style={styles.input} />
        <Text style={styles.text}>{`Refund to customer: $${(customerRefund / 100).toFixed(2)}`}</Text>
      </View>
      <PrimaryButton label={t('escrow.proposeSplit')} disabled={proposeMutation.isPending} onPress={() => void proposeMutation.mutateAsync()} />
      <PrimaryButton label={t('escrow.sign')} variant="secondary" disabled={!proposalId || signMutation.isPending} onPress={() => void signMutation.mutateAsync()} />
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.textPrimary,
    backgroundColor: colors.bg,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
