import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { getProject, selectContractor } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'QuotesCompare'>;

export function QuotesCompareScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const role = useAppStore((s) => s.role);
  const projectId = route.params.projectId;

  const projectQuery = useQuery({
    queryKey: ['project', projectId, 'quotes'],
    queryFn: () => getProject({ projectId }),
  });

  const selectMutation = useMutation({
    mutationFn: (quoteId: string) => selectContractor({ projectId, quoteId }),
    onSuccess: () => {
      navigation.replace('AgreementReview', { projectId });
    },
    onError: (error) => {
      Alert.alert(t('common.error'), String(error));
    },
  });

  if (projectQuery.isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.text}>{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <ScreenContainer>
        <Text style={styles.text}>{t('common.error')}</Text>
      </ScreenContainer>
    );
  }

  const quotes = projectQuery.data.quotes ?? [];

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('quote.compare')}</Text>
      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{`${t('quote.price')}: $${(Number(item.priceCents ?? 0) / 100).toFixed(2)}`}</Text>
            <Text style={styles.text}>{`${t('quote.timelineDays')}: ${item.timelineDays}`}</Text>
            <Text style={styles.text}>{item.scopeNotes}</Text>
            {role === 'customer' ? (
              <PrimaryButton
                label={t('project.selectContractor')}
                disabled={selectMutation.isPending}
                onPress={() => {
                  void selectMutation.mutateAsync(item.id);
                }}
              />
            ) : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>{t('quote.noQuotes')}</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  text: {
    color: colors.textPrimary,
  },
});
