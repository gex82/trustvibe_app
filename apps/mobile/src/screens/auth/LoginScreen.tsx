import React from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
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

type FormValue = {
  email: string;
  password: string;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
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

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.brand}>TrustVibe</Text>
      <Text style={styles.title}>{t('auth.loginTitle')}</Text>

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
        onPress={async () => {
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
        }}
      >
        <Text style={styles.link}>{t('auth.resetPassword')}</Text>
      </Pressable>

      <PrimaryButton
        label={t('auth.loginTitle')}
        disabled={formState.isSubmitting}
        onPress={handleSubmit(async (values) => {
          try {
            setSubmitError(null);
            await login(values);
          } catch (error) {
            const message = mapApiError(error);
            setSubmitError(message);
            Alert.alert(t('common.error'), message);
          }
        })}
      />
      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

      <PrimaryButton label={t('auth.registerTitle')} variant="secondary" onPress={() => navigation.navigate('Register')} />
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
});
