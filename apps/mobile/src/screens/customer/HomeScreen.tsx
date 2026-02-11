import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { listProjects } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { HomeStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjects({ limit: 50 }),
  });

  return (
    <ScreenContainer>
      <PrimaryButton label={t('project.create.title')} onPress={() => navigation.navigate('CreateProject')} />

      {projectsQuery.isLoading ? <ActivityIndicator color={colors.accent} /> : null}

      <FlatList
        data={projectsQuery.data?.projects ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.municipality}</Text>
            <Text style={styles.subtitle}>{item.escrowState}</Text>
            <PrimaryButton label={t('common.nextAction')} onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('common.loading')}</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  empty: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
