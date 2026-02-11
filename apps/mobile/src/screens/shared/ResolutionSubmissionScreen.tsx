import React from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { uploadResolutionDocument } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ResolutionSubmission'>;

export function ResolutionSubmissionScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const projectId = route.params.projectId;
  const [documentUrl, setDocumentUrl] = React.useState('https://example.com/final-resolution.pdf');
  const [summary, setSummary] = React.useState('Final signed settlement attached.');

  const mutation = useMutation({
    mutationFn: () =>
      uploadResolutionDocument({
        projectId,
        documentUrl,
        resolutionType: 'signed_settlement',
        summary,
      }),
    onSuccess: () => {
      Alert.alert(t('common.status'), t('phase2.resolutionSubmitted'));
      navigation.replace('ProjectDetail', { projectId });
    },
    onError: (error) => Alert.alert(t('common.error'), String(error)),
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('escrow.resolutionUpload')}</Text>
      <TextInput value={documentUrl} onChangeText={setDocumentUrl} placeholder="https://..." placeholderTextColor={colors.textSecondary} style={styles.input} />
      <TextInput value={summary} onChangeText={setSummary} placeholder={t('project.description')} placeholderTextColor={colors.textSecondary} style={[styles.input, styles.textArea]} multiline />
      <PrimaryButton label={t('common.submit')} disabled={mutation.isPending} onPress={() => void mutation.mutateAsync()} />
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    color: colors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
