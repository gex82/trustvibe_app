import React from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { createProject, mapApiError } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { FormInput } from '../../components/FormInput';
import type { HomeStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';

const schema = z.object({
  category: z.string().min(2),
  title: z.string().min(3),
  description: z.string().min(10),
  municipality: z.string().min(2),
  desiredTimeline: z.string().min(2),
});

type FormValue = z.infer<typeof schema>;

type Props = NativeStackScreenProps<HomeStackParamList, 'CreateProject'>;

export function CreateProjectScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { control, handleSubmit, formState } = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'plumbing',
      title: '',
      description: '',
      municipality: 'San Juan',
      desiredTimeline: 'Within 2 weeks',
    },
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('project.create.title')}</Text>

      <Controller
        control={control}
        name="category"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput value={value} onChangeText={onChange} label={t('project.category')} iconName="hammer-outline" error={fieldState.error?.message} />
        )}
      />
      <Controller
        control={control}
        name="title"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput value={value} onChangeText={onChange} label={t('project.title')} iconName="create-outline" error={fieldState.error?.message} />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput
            value={value}
            onChangeText={onChange}
            label={t('project.description')}
            iconName="document-text-outline"
            error={fieldState.error?.message}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        )}
      />
      <Controller
        control={control}
        name="municipality"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput value={value} onChangeText={onChange} label={t('profile.municipality')} iconName="location-outline" error={fieldState.error?.message} />
        )}
      />
      <Controller
        control={control}
        name="desiredTimeline"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput value={value} onChangeText={onChange} label={t('project.timeline')} iconName="time-outline" error={fieldState.error?.message} />
        )}
      />

      <PrimaryButton
        label={formState.isSubmitting ? t('common.loading') : t('common.submit')}
        disabled={formState.isSubmitting}
        onPress={handleSubmit(async (values) => {
          try {
            const result = await createProject({
              ...values,
              photos: [],
            });
            navigation.replace('ProjectDetail', { projectId: result.project.id });
          } catch (error) {
            Alert.alert(t('common.error'), mapApiError(error));
          }
        })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 28,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
