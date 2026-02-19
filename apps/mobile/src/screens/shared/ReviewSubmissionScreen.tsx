import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { mapApiError, submitReview } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StarRating } from '../../components/StarRating';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReviewSubmission'>;

export function ReviewSubmissionScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const projectId = route.params.projectId;
  const [rating, setRating] = React.useState(5);
  const [feedback, setFeedback] = React.useState('');
  const [statusBanner, setStatusBanner] = React.useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const navigateTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (navigateTimerRef.current) {
        clearTimeout(navigateTimerRef.current);
        navigateTimerRef.current = null;
      }
    };
  }, []);

  const mutation = useMutation({
    mutationFn: () =>
      submitReview({
        projectId,
        rating,
        feedback,
        tags: ['quality', 'communication'],
      }),
    onSuccess: () => {
      setStatusBanner({ kind: 'success', message: t('phase2.reviewSubmitted') });
      navigateTimerRef.current = setTimeout(() => {
        navigation.replace('ProjectDetail', { projectId });
      }, 900);
    },
    onError: (error) => setStatusBanner({ kind: 'error', message: mapApiError(error) }),
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('reviews.submit')}</Text>
      <StarRating value={rating} onChange={setRating} disabled={mutation.isPending} />
      {statusBanner ? (
        <View style={[styles.banner, statusBanner.kind === 'success' ? styles.bannerSuccess : styles.bannerError]}>
          <Text style={[styles.bannerText, statusBanner.kind === 'success' ? styles.bannerTextSuccess : styles.bannerTextError]}>
            {statusBanner.message}
          </Text>
        </View>
      ) : null}
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
  bannerText: {
    fontWeight: '600',
  },
  bannerTextSuccess: {
    color: '#1F6F35',
  },
  bannerTextError: {
    color: colors.danger,
  },
});
