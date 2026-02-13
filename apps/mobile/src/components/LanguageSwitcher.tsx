import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import i18n from 'i18next';
import { useAppStore } from '../store/appStore';
import { colors, radii, spacing } from '../theme/tokens';

type Props = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: Props): React.JSX.Element {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  function select(nextLanguage: 'en' | 'es'): void {
    setLanguage(nextLanguage);
    void i18n.changeLanguage(nextLanguage);
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Pressable
        style={[styles.option, language === 'en' && styles.optionActive]}
        onPress={() => select('en')}
      >
        <Text style={[styles.label, language === 'en' && styles.labelActive]}>EN</Text>
      </Pressable>
      <Pressable
        style={[styles.option, language === 'es' && styles.optionActive]}
        onPress={() => select('es')}
      >
        <Text style={[styles.label, language === 'es' && styles.labelActive]}>ES</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
  wrapCompact: {
    marginLeft: spacing.sm,
  },
  option: {
    borderRadius: radii.full,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
  },
  optionActive: {
    backgroundColor: colors.navy,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  labelActive: {
    color: colors.textInverse,
  },
});
