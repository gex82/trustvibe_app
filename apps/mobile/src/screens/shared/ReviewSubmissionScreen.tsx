import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { submitReview } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReviewSubmission'>;

export function ReviewSubmissionScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const projectId = route.params.projectId;
  const [rating, setRating] = React.useState(5);
  const [feedback, setFeedback] = React.useState('');

  const mutation = useMutation({
    mutationFn: () =>
      submitReview({
        projectId,
        rating,
        feedback,
        tags: ['quality', 'communication'],
      }),
    onSuccess: () => {
      Alert.alert(t('common.status'), t('phase2.reviewSubmitted'));
      navigation.replace('ProjectDetail', { projectId });
    },
    onError: (error) => Alert.alert(t('common.error'), String(error)),
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('reviews.submit')}</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((value) => (
          <PrimaryButton key={value} label={String(value)} variant={rating === value ? 'primary' : 'secondary'} onPress={() => setRating(value)} />
        ))}
      </View>
      <TextInput
        value={feedback}
        onChangeText={setFeedback}
        placeholder={t('project.description')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, styles.textArea]}
        multiline
      />
      <PrimaryButton label={t('reviews.submit')} disabled={mutation.isPending || feedback.trim().length < 3} onPress={() => void mutation.mutateAsync()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.xs },
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
