import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { logError, logWarn } from '../../services/logger';

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
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [slowRequestMessage, setSlowRequestMessage] = React.useState<string | null>(null);
  const slowTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
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

  React.useEffect(
    () => () => {
      if (slowTimerRef.current) {
        clearTimeout(slowTimerRef.current);
      }
    },
    []
  );

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('auth.registerTitle')}</Text>
      <Text style={styles.subtitle}>{t('auth.registeringAs', { role: role === 'contractor' ? t('auth.roleContractor') : t('auth.roleCustomer') })}</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput
            testID="register-name-input"
            containerTestID="register-name-field"
            value={value}
            onChangeText={onChange}
            label={t('profile.name')}
            iconName="person-outline"
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput
            testID="register-email-input"
            containerTestID="register-email-field"
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
            testID="register-phone-input"
            containerTestID="register-phone-field"
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
            testID="register-password-input"
            containerTestID="register-password-field"
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
            testID="register-confirm-password-input"
            containerTestID="register-confirm-password-field"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            label={t('auth.confirmPassword')}
            iconName="lock-closed-outline"
            error={fieldState.error?.message}
          />
        )}
      />

      <Pressable
        testID="register-accept-terms"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        onPress={() => setValue('accepted', !accepted)}
        style={styles.checkboxRow}
      >
        <View style={[styles.checkbox, accepted ? styles.checkboxOn : null]} />
        <Text style={styles.checkboxLabel}>{t('auth.acceptTerms')}</Text>
      </Pressable>

      <PrimaryButton
        testID="register-submit"
        label={t('auth.registerTitle')}
        disabled={formState.isSubmitting}
        onPress={handleSubmit(async (values) => {
          try {
            setSubmitError(null);
            setSlowRequestMessage(null);
            if (slowTimerRef.current) {
              clearTimeout(slowTimerRef.current);
            }
            slowTimerRef.current = setTimeout(() => {
              setSlowRequestMessage(t('auth.requestTakingLonger'));
              logWarn('auth.register.slow_request', { email: values.email, role });
            }, 8000);
            await register({ name: values.name, email: values.email, password: values.password, role });
          } catch (error) {
            const message = mapApiError(error);
            setSubmitError(message);
            logError('auth.register.failed', error, { email: values.email, role });
            Alert.alert(t('common.error'), message);
          } finally {
            if (slowTimerRef.current) {
              clearTimeout(slowTimerRef.current);
              slowTimerRef.current = null;
            }
            setSlowRequestMessage(null);
          }
        })}
      />
      {formState.isSubmitting ? (
        <View testID="register-progress" style={styles.progressRow}>
          <ActivityIndicator color={colors.navy} />
          <Text style={styles.progressText}>{t('auth.registerInProgress')}</Text>
        </View>
      ) : null}
      {slowRequestMessage ? <Text style={styles.warning}>{slowRequestMessage}</Text> : null}
      {submitError ? <Text testID="register-error" style={styles.error}>{submitError}</Text> : null}

      <PrimaryButton testID="register-go-login" label={t('auth.loginTitle')} variant="secondary" onPress={() => navigation.navigate('Login')} />
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  warning: {
    color: colors.warning,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
  },
});
