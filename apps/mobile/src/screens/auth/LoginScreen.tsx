import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { login, mapApiError, resetPassword } from '../../services/api';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';
import { logWarn } from '../../services/logger';

type FormValue = {
  email: string;
  password: string;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [slowRequestMessage, setSlowRequestMessage] = React.useState<string | null>(null);
  const slowTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const schema = React.useMemo(
    () =>
      z.object({
        email: z.string().email(t('validation.emailInvalid')),
        password: z.string().min(6, t('validation.passwordMin')),
      }),
    [t]
  );
  const { control, handleSubmit, watch, formState } = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const email = watch('email');

  const clearSlowTimer = React.useCallback(() => {
    if (!slowTimerRef.current) {
      return;
    }
    clearTimeout(slowTimerRef.current);
    slowTimerRef.current = null;
  }, []);

  React.useEffect(
    () => () => {
      clearSlowTimer();
    },
    [clearSlowTimer]
  );

  const handleResetPassword = React.useCallback(async () => {
    if (!email) {
      Alert.alert(t('common.error'), t('auth.resetPasswordEmailPrompt'));
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert(t('common.status'), t('auth.resetPasswordSent'));
    } catch (error) {
      Alert.alert(t('common.error'), mapApiError(error));
    }
  }, [email, t]);

  const submitLogin = React.useCallback(
    async (values: FormValue) => {
      try {
        setSubmitError(null);
        setSlowRequestMessage(null);
        clearSlowTimer();
        slowTimerRef.current = setTimeout(() => {
          setSlowRequestMessage(t('auth.requestTakingLonger'));
          logWarn('auth.login.slow_request', { email: values.email });
        }, 8000);
        await login(values);
      } catch (error) {
        const message = mapApiError(error);
        setSubmitError(message);
        logWarn('auth.login.failed', { email: values.email }, error);
        Alert.alert(t('common.error'), message);
      } finally {
        clearSlowTimer();
        setSlowRequestMessage(null);
      }
    },
    [clearSlowTimer, t]
  );

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.brand}>TrustVibe</Text>
      <Text style={styles.title}>{t('auth.loginTitle')}</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput
            testID="login-email-input"
            containerTestID="login-email-field"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            keyboardType="email-address"
            label={t('auth.email')}
            placeholder={t('auth.email')}
            iconName="mail-outline"
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormInput
            testID="login-password-input"
            containerTestID="login-password-field"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            label={t('auth.password')}
            placeholder={t('auth.password')}
            iconName="lock-closed-outline"
            error={fieldState.error?.message}
          />
        )}
      />

      <Pressable
        testID="login-reset-password"
        onPress={() => {
          void handleResetPassword();
        }}
      >
        <Text style={styles.link}>{t('auth.resetPassword')}</Text>
      </Pressable>

      <PrimaryButton
        testID="login-submit"
        label={t('auth.loginTitle')}
        disabled={formState.isSubmitting}
        onPress={handleSubmit(submitLogin)}
      />
      {formState.isSubmitting ? (
        <View testID="login-progress" style={styles.progressRow}>
          <ActivityIndicator color={colors.navy} />
          <Text style={styles.progressText}>{t('auth.signInInProgress')}</Text>
        </View>
      ) : null}
      {slowRequestMessage ? <Text style={styles.warning}>{slowRequestMessage}</Text> : null}
      {submitError ? <Text testID="login-error" style={styles.error}>{submitError}</Text> : null}

      <PrimaryButton testID="login-go-register" label={t('auth.registerTitle')} variant="secondary" onPress={() => navigation.navigate('Register')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    gap: spacing.sm,
  },
  brand: {
    color: colors.navy,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  link: {
    color: colors.navy,
    fontWeight: '600',
    textAlign: 'right',
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
  },
  warning: {
    color: colors.warning,
    fontWeight: '600',
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
});
