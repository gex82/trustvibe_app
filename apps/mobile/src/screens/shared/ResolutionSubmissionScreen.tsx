import React from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { uploadResolutionDocument, mapApiError } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';
import { pickDocument, uploadToStorage } from '../../services/upload';
import { useAppStore } from '../../store/appStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'ResolutionSubmission'>;

export function ResolutionSubmissionScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const projectId = route.params.projectId;
  const [documentUrl, setDocumentUrl] = React.useState('');
  const [summary, setSummary] = React.useState(t('resolution.defaultSummary'));
  const [uploading, setUploading] = React.useState(false);

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
    onError: (error) => Alert.alert(t('common.error'), mapApiError(error)),
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('escrow.resolutionUpload')}</Text>
      <PrimaryButton
        label={uploading ? t('common.loading') : t('resolution.uploadFile')}
        variant="secondary"
        disabled={uploading || !user?.uid}
        onPress={async () => {
          try {
            if (!user?.uid) {
              return;
            }
            setUploading(true);
            const localUri = await pickDocument();
            if (!localUri) {
              return;
            }
            const url = await uploadToStorage(localUri, `resolutions/${projectId}/${Date.now()}-${user.uid}`);
            setDocumentUrl(url);
          } catch (error) {
            Alert.alert(t('common.error'), mapApiError(error));
          } finally {
            setUploading(false);
          }
        }}
      />
      <TextInput value={documentUrl} onChangeText={setDocumentUrl} placeholder={t('resolution.uploadedUrl')} placeholderTextColor={colors.textSecondary} style={styles.input} />
      <TextInput value={summary} onChangeText={setSummary} placeholder={t('project.description')} placeholderTextColor={colors.textSecondary} style={[styles.input, styles.textArea]} multiline />
      <PrimaryButton label={t('common.submit')} disabled={mutation.isPending || !documentUrl.trim()} onPress={() => void mutation.mutateAsync()} />
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
  input: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
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
