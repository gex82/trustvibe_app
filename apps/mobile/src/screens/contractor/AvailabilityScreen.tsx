import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, spacing } from '../../theme/tokens';

export function AvailabilityScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('availability.title')}</Text>
      <View style={styles.card}>
        <Text style={styles.text}>{t('availability.hours')}</Text>
        <Text style={styles.text}>{t('availability.blackouts')}</Text>
      </View>
      {savedAt ? <Text style={styles.meta}>{savedAt}</Text> : null}
      <PrimaryButton label={t('common.save')} onPress={() => setSavedAt(new Date().toLocaleString())} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.xs,
  },
  text: { color: colors.textPrimary },
  meta: { color: colors.textSecondary, fontSize: 12 },
});
