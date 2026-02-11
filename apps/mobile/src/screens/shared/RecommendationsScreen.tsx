import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { applyReferralCode, getRecommendations, listFeaturedListings } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';

export function RecommendationsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role) ?? 'customer';
  const [code, setCode] = React.useState('');

  const recommendationsQuery = useQuery({
    queryKey: ['recommendations', role],
    queryFn: () => getRecommendations({ target: role }),
  });

  const featuredQuery = useQuery({
    queryKey: ['featured-listings'],
    queryFn: () => listFeaturedListings({ limit: 10 }),
  });

  const referralMutation = useMutation({
    mutationFn: () => applyReferralCode({ code }),
    onSuccess: () => {
      setCode('');
      Alert.alert(t('common.status'), t('phase2.codeApplied'));
    },
    onError: (error) => Alert.alert(t('common.error'), String(error)),
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('phase2.recommendationsTitle')}</Text>
      {recommendationsQuery.isLoading ? <Text style={styles.text}>{t('common.loading')}</Text> : null}
      {recommendationsQuery.isError ? <Text style={styles.text}>{t('common.error')}</Text> : null}
      <FlatList
        data={recommendationsQuery.data?.recommendations ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{item.reason}</Text>
            <Text style={styles.muted}>{item.contractorId ?? item.projectId ?? item.id}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>{t('phase2.noRecommendations')}</Text>}
      />

      <Text style={styles.subtitle}>{t('phase2.featuredListings')}</Text>
      {featuredQuery.isLoading ? <Text style={styles.text}>{t('common.loading')}</Text> : null}
      <FlatList
        data={featuredQuery.data?.featured ?? []}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{item.code}</Text>
            <Text style={styles.muted}>{item.contractorId ?? 'N/A'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>{t('phase2.noFeatured')}</Text>}
      />

      <TextInput value={code} onChangeText={setCode} placeholder={t('phase2.referralCode')} placeholderTextColor={colors.textSecondary} style={styles.input} />
      <PrimaryButton label={t('phase2.applyReferral')} disabled={!code.trim() || referralMutation.isPending} onPress={() => void referralMutation.mutateAsync()} />
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
  subtitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  text: { color: colors.textPrimary },
  muted: { color: colors.textSecondary },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.xs,
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
