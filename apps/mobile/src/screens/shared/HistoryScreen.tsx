import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'History'>;

export function HistoryScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const sampleEvents = [
    { id: 'h1', title: t('history.eventEscrowFundedTitle'), subtitle: t('history.eventEscrowFundedSubtitle') },
    { id: 'h2', title: t('history.eventCompletionRequestedTitle'), subtitle: t('history.eventCompletionRequestedSubtitle') },
    { id: 'h3', title: t('history.eventMessageReceivedTitle'), subtitle: t('history.eventMessageReceivedSubtitle') },
  ];

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('history.title')}</Text>
      <Text style={styles.subtitle}>{t('history.transactions')}</Text>

      <View style={styles.list}>
        {sampleEvents.map((event) => (
          <Card key={event.id}>
            <Text style={styles.itemTitle}>{event.title}</Text>
            <Text style={styles.itemMeta}>{event.subtitle}</Text>
          </Card>
        ))}
      </View>

      <PrimaryButton label={t('phase2.recommendationsTitle')} variant="secondary" onPress={() => navigation.navigate('Recommendations')} />
      {role === 'contractor' ? (
        <PrimaryButton label={t('availability.title')} variant="secondary" onPress={() => navigation.navigate('Availability')} />
      ) : null}
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
  list: {
    gap: spacing.sm,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  itemMeta: {
    color: colors.textSecondary,
  },
});
