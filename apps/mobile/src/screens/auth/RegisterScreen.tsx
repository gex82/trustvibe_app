import React from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { logWarn } from '../../services/logger';
import { TERMS_CONTENT, type TermsLanguage } from '../../legal/termsContent';

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
  const appLanguage = useAppStore((s) => s.language);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [slowRequestMessage, setSlowRequestMessage] = React.useState<string | null>(null);
  const [termsVisible, setTermsVisible] = React.useState(false);
  const [termsLanguage, setTermsLanguage] = React.useState<TermsLanguage>('en');
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

  const clearSlowTimer = React.useCallback(() => {
    if (!slowTimerRef.current) {
      return;
    }
    clearTimeout(slowTimerRef.current);
    slowTimerRef.current = null;
  }, []);

  React.useEffect(() => {
    setTermsLanguage(appLanguage === 'es' ? 'es' : 'en');
  }, [appLanguage]);

  React.useEffect(
    () => () => {
      clearSlowTimer();
    },
    [clearSlowTimer]
  );

  function openTermsModal(): void {
    setTermsVisible(true);
  }

  function closeTermsModal(): void {
    setTermsVisible(false);
  }

  function acceptTerms(): void {
    setValue('accepted', true, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setTermsVisible(false);
  }

  const submitRegister = React.useCallback(
    async (values: FormValue) => {
      try {
        setSubmitError(null);
        setSlowRequestMessage(null);
        clearSlowTimer();
        slowTimerRef.current = setTimeout(() => {
          setSlowRequestMessage(t('auth.requestTakingLonger'));
          logWarn('auth.register.slow_request', { email: values.email, role });
        }, 8000);
        await register({ name: values.name, email: values.email, password: values.password, role });
      } catch (error) {
        const message = mapApiError(error);
        setSubmitError(message);
        logWarn('auth.register.failed', { email: values.email, role }, error);
        Alert.alert(t('common.error'), message);
      } finally {
        clearSlowTimer();
        setSlowRequestMessage(null);
      }
    },
    [clearSlowTimer, role, t]
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

      <View style={styles.checkboxRow}>
        <Pressable
          testID="register-accept-terms"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
          onPress={openTermsModal}
          style={styles.checkboxPressable}
        >
          <View style={[styles.checkbox, accepted ? styles.checkboxOn : null]} />
        </Pressable>
        <View style={styles.checkboxLabelWrap}>
          <Text style={styles.checkboxLabel}>
            {t('auth.acceptTermsPrefix')}
            <Text
              testID="register-open-terms"
              accessibilityRole="link"
              onPress={openTermsModal}
              style={styles.termsLink}
            >
              {t('auth.acceptTermsLink')}
            </Text>
          </Text>
          {!accepted ? (
            <Text style={styles.error}>{t('auth.termsRequiredToContinue')}</Text>
          ) : null}
        </View>
      </View>

      <PrimaryButton
        testID="register-submit"
        label={t('auth.registerTitle')}
        disabled={formState.isSubmitting || !accepted}
        onPress={handleSubmit(submitRegister)}
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

      <Modal visible={termsVisible} transparent animationType="slide" onRequestClose={closeTermsModal}>
        <View style={styles.termsOverlay}>
          <View testID="register-terms-modal" style={styles.termsCard}>
            <Text style={styles.termsTitle}>{t('auth.termsModalTitle')}</Text>
            <View style={styles.languageToggleWrap}>
              <Pressable
                testID="register-terms-lang-en"
                style={[styles.languageToggle, termsLanguage === 'en' ? styles.languageToggleActive : null]}
                onPress={() => setTermsLanguage('en')}
              >
                <Text style={[styles.languageToggleText, termsLanguage === 'en' ? styles.languageToggleTextActive : null]}>
                  {t('common.english')}
                </Text>
              </Pressable>
              <Pressable
                testID="register-terms-lang-es"
                style={[styles.languageToggle, termsLanguage === 'es' ? styles.languageToggleActive : null]}
                onPress={() => setTermsLanguage('es')}
              >
                <Text style={[styles.languageToggleText, termsLanguage === 'es' ? styles.languageToggleTextActive : null]}>
                  {t('common.spanish')}
                </Text>
              </Pressable>
            </View>
            <ScrollView style={styles.termsBodyWrap} contentContainerStyle={styles.termsBodyContent}>
              <Text style={styles.termsBody}>{TERMS_CONTENT[termsLanguage]}</Text>
            </ScrollView>
            <View style={styles.termsActions}>
              <PrimaryButton testID="register-terms-close" label={t('auth.termsCloseAction')} variant="secondary" onPress={closeTermsModal} />
              <PrimaryButton testID="register-terms-accept" label={t('auth.termsAgreeAction')} onPress={acceptTerms} />
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  checkboxPressable: {
    paddingTop: spacing.xs,
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
  },
  checkboxLabelWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  termsLink: {
    color: colors.info,
    textDecorationLine: 'underline',
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
  warning: {
    color: colors.warning,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
  },
  termsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 71, 0.45)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  termsCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
    maxHeight: '90%',
  },
  termsTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  languageToggleWrap: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xxs,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  languageToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  languageToggleActive: {
    backgroundColor: colors.navy,
  },
  languageToggleText: {
    color: colors.navyDark,
    fontWeight: '700',
  },
  languageToggleTextActive: {
    color: colors.textInverse,
  },
  termsBodyWrap: {
    flexGrow: 0,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    maxHeight: 360,
  },
  termsBodyContent: {
    paddingVertical: spacing.md,
  },
  termsBody: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
  },
  termsActions: {
    gap: spacing.xs,
  },
});
