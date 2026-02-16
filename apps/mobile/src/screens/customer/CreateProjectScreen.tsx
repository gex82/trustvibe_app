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
import { PickerInput, type PickerOption } from '../../components/PickerInput';
import type { HomeStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';
import municipalitiesData from '../../../../../data/demo/municipalities.json';

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
  const categoryOptions = React.useMemo<PickerOption[]>(
    () => [
      { value: 'plumbing', label: t('project.category.plumbing') },
      { value: 'electrical', label: t('project.category.electrical') },
      { value: 'painting', label: t('project.category.painting') },
      { value: 'carpentry', label: t('project.category.carpentry') },
      { value: 'roofing', label: t('project.category.roofing') },
      { value: 'general', label: t('project.category.general') },
      { value: 'other', label: t('common.other') },
    ],
    [t]
  );
  const municipalityOptions = React.useMemo<PickerOption[]>(
    () => [
      ...(municipalitiesData as Array<{ name: string }>).map((item) => ({
        value: item.name,
        label: item.name,
      })),
      { value: 'other', label: t('common.other') },
    ],
    [t]
  );
  const timelineOptions = React.useMemo<PickerOption[]>(
    () => [
      { value: 'immediately', label: t('project.timeline.immediately') },
      { value: 'within1Week', label: t('project.timeline.within1Week') },
      { value: 'within2Weeks', label: t('project.timeline.within2Weeks') },
      { value: 'within1Month', label: t('project.timeline.within1Month') },
      { value: 'flexible', label: t('project.timeline.flexible') },
      { value: 'other', label: t('common.other') },
    ],
    [t]
  );

  const { control, handleSubmit, formState } = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'plumbing',
      title: '',
      description: '',
      municipality: 'San Juan',
      desiredTimeline: 'within2Weeks',
    },
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('project.create.title')}</Text>

      <Controller
        control={control}
        name="category"
        render={({ field: { value, onChange }, fieldState }) => (
          <PickerInput
            testID="project-category"
            value={value}
            onChange={onChange}
            label={t('project.category')}
            iconName="hammer-outline"
            error={fieldState.error?.message}
            options={categoryOptions}
            allowCustom
            customOptionLabel={t('common.other')}
            customInputPlaceholder={t('project.create.customValuePlaceholder')}
          />
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
          <PickerInput
            testID="project-municipality"
            value={value}
            onChange={onChange}
            label={t('profile.municipality')}
            iconName="location-outline"
            error={fieldState.error?.message}
            options={municipalityOptions}
            allowCustom
            customOptionLabel={t('common.other')}
            customInputPlaceholder={t('project.create.customValuePlaceholder')}
          />
        )}
      />
      <Controller
        control={control}
        name="desiredTimeline"
        render={({ field: { value, onChange }, fieldState }) => (
          <PickerInput
            testID="project-desired-timeline"
            value={value}
            onChange={onChange}
            label={t('project.timeline')}
            iconName="time-outline"
            error={fieldState.error?.message}
            options={timelineOptions}
            allowCustom
            customOptionLabel={t('common.other')}
            customInputPlaceholder={t('project.create.customValuePlaceholder')}
          />
        )}
      />

      <PrimaryButton
        label={formState.isSubmitting ? t('common.loading') : t('common.submit')}
        disabled={formState.isSubmitting}
        onPress={handleSubmit(async (values) => {
          try {
            const result = await createProject({
              ...values,
              category: categoryOptions.find((item) => item.value === values.category)?.label ?? values.category,
              desiredTimeline: timelineOptions.find((item) => item.value === values.desiredTimeline)?.label ?? values.desiredTimeline,
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
