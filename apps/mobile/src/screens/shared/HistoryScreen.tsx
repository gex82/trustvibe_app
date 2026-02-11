import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppStore } from '../../store/appStore';
import { colors } from '../../theme/tokens';

export function HistoryScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const navigation = useNavigation<any>();
  return (
    <ScreenContainer>
      <Text style={styles.text}>{t('history.title')}</Text>
      <Text style={styles.text}>{t('history.transactions')}</Text>
      <View style={styles.actions}>
        <PrimaryButton label="Recommendations" onPress={() => navigation.navigate('Projects', { screen: 'Recommendations' })} />
        {role === 'contractor' ? (
          <PrimaryButton label="Availability" variant="secondary" onPress={() => navigation.navigate('Projects', { screen: 'Availability' })} />
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.textPrimary,
    marginBottom: 12,
  },
  actions: {
    gap: 10,
  },
});
