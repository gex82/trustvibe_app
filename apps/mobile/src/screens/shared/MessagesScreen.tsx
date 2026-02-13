import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { listMessages, listProjects, mapApiError, sendMessage } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing } from '../../theme/tokens';

export function MessagesScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [body, setBody] = React.useState('');

  const projectsQuery = useQuery({
    queryKey: ['messages-projects'],
    queryFn: () => listProjects({ limit: 50 }),
  });

  React.useEffect(() => {
    if (!projectId && projectsQuery.data?.projects?.length) {
      setProjectId(projectsQuery.data.projects[0].id);
    }
  }, [projectId, projectsQuery.data?.projects]);

  const messagesQuery = useQuery({
    queryKey: ['project-messages', projectId],
    queryFn: () => listMessages({ projectId: projectId as string, limit: 100 }),
    enabled: Boolean(projectId),
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { projectId: string; body: string }) => sendMessage(payload),
    onSuccess: async () => {
      setBody('');
      await messagesQuery.refetch();
    },
    onError: (error) => {
      Alert.alert(t('common.error'), mapApiError(error));
    },
  });

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('messaging.title')}</Text>
      {projectsQuery.isError ? <Text style={styles.error}>{mapApiError(projectsQuery.error)}</Text> : null}

      <FlatList
        horizontal
        data={projectsQuery.data?.projects ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.projects}
        renderItem={({ item }) => (
          <PrimaryButton
            label={item.title}
            variant={projectId === item.id ? 'primary' : 'secondary'}
            onPress={() => setProjectId(item.id)}
          />
        )}
        ListEmptyComponent={<EmptyState title={t('messaging.noProjects')} description={t('messaging.startConversationHint')} />}
      />

      <FlatList
        data={messagesQuery.data?.messages ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.messageBubble}>
              <Text style={styles.messageMeta}>{item.senderId}</Text>
              <Text style={styles.text}>{item.body}</Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          messagesQuery.isLoading ? (
            <Text style={styles.text}>{t('common.loading')}</Text>
          ) : (
            <EmptyState title={t('messaging.noMessages')} description={t('messaging.firstMessageHint')} />
          )
        }
      />

      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder={t('messaging.typeMessage')}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      <PrimaryButton
        label={t('common.submit')}
        disabled={!projectId || !body.trim() || sendMutation.isPending}
        onPress={() => {
          if (!projectId) {
            return;
          }
          void sendMutation.mutateAsync({ projectId, body: body.trim() });
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontSize: 28,
    fontWeight: '800',
  },
  text: {
    color: colors.textPrimary,
  },
  error: {
    color: colors.danger,
  },
  projects: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  messages: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  messageBubble: {
    gap: spacing.xs,
  },
  messageMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
});
