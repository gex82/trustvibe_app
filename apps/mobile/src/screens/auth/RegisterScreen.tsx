import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { register, mapApiError } from '../../services/api';
import type { AuthStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';

type FormValue = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accepted: boolean;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role) ?? 'customer';
  const schema = React.useMemo(
    () =>
      z
        .object({
          name: z.string().min(2, t('validation.nameMin')),
          email: z.string().email(t('validation.emailInvalid')),
          phone: z.string().min(7, t('validation.phoneMin')),
          password: z.string().min(6, t('validation.passwordMin')),
          confirmPassword: z.string().min(6, t('validation.passwordMin')),
          accepted: z.boolean().refine((v) => v, t('validation.acceptTerms')),
        })
        .refine((v) => v.password === v.confirmPassword, {
          message: t('validation.passwordsNoMatch'),
          path: ['confirmPassword'],
        }),
    [t]
  );
  const { control, handleSubmit, formState, watch, setValue } = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '', accepted: false },
  });
  const accepted = watch('accepted');

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('auth.registerTitle')}</Text>
      <Text style={styles.subtitle}>{t('auth.registeringAs', { role: role === 'contractor' ? t('auth.roleContractor') : t('auth.roleCustomer') })}</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput value={value} onChangeText={onChange} label={t('profile.name')} iconName="person-outline" error={fieldState.error?.message} />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            keyboardType="email-address"
            label={t('auth.email')}
            iconName="mail-outline"
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput
            value={value}
            onChangeText={onChange}
            keyboardType="phone-pad"
            label={t('profile.phone')}
            iconName="call-outline"
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput
            value={value}
            onChangeText={onChange}
            secureTextEntry
            label={t('auth.password')}
            iconName="lock-closed-outline"
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput
            value={value}
            onChangeText={onChange}
            secureTextEntry
            label={t('auth.confirmPassword')}
            iconName="lock-closed-outline"
            error={fieldState.error?.message}
          />
        )}
      />

      <Pressable onPress={() => setValue('accepted', !accepted)} style={styles.checkboxRow}>
        <View style={[styles.checkbox, accepted ? styles.checkboxOn : null]} />
        <Text style={styles.checkboxLabel}>{t('auth.acceptTerms')}</Text>
      </Pressable>

      <PrimaryButton
        label={t('auth.registerTitle')}
        disabled={formState.isSubmitting}
        onPress={handleSubmit(async (values) => {
          try {
            await register({ name: values.name, email: values.email, password: values.password, role });
          } catch (error) {
            Alert.alert(t('common.error'), mapApiError(error));
          }
        })}
      />

      <PrimaryButton label={t('auth.loginTitle')} variant="secondary" onPress={() => navigation.navigate('Login')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  checkboxOn: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  checkboxLabel: {
    color: colors.textSecondary,
    flex: 1,
  },
});
