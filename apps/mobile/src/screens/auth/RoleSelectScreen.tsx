import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppStore } from '../../store/appStore';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelect'>;

export function RoleSelectScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const setRole = useAppStore((s) => s.setRole);

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('auth.roleTitle')}</Text>
      <View style={styles.actions}>
        <PrimaryButton
          label={t('auth.roleCustomer')}
          onPress={() => {
            setRole('customer');
            navigation.navigate('Login');
          }}
        />
        <PrimaryButton
          label={t('auth.roleContractor')}
          onPress={() => {
            setRole('contractor');
            navigation.navigate('Login');
          }}
          variant="secondary"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
});
