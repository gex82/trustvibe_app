import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { login } from '../../services/api';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValue = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { control, handleSubmit, formState } = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('auth.loginTitle')}</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            placeholder={t('auth.email')}
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            secureTextEntry
            placeholder={t('auth.password')}
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        )}
      />

      <PrimaryButton
        label={t('auth.loginTitle')}
        disabled={formState.isSubmitting}
        onPress={handleSubmit(async (values) => {
          try {
            await login(values);
          } catch (error) {
            Alert.alert(t('common.error'), String(error));
          }
        })}
      />

      <PrimaryButton label={t('auth.registerTitle')} variant="secondary" onPress={() => navigation.navigate('Register')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.sm,
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
});
