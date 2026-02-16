import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { listMessages, listProjects, mapApiError, sendMessage } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing } from '../../theme/tokens';
import { useAppStore } from '../../store/appStore';
import { getLocalizedField, getLocalizedProjectTitle } from '../../utils/localizedProject';

export function MessagesScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
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
          <Pressable
            testID={`messages-project-${item.id}`}
            style={[
              styles.projectCard,
              projectId === item.id ? styles.projectCardActive : null,
            ]}
            onPress={() => setProjectId(item.id)}
          >
            <Text numberOfLines={2} style={[styles.projectCardLabel, projectId === item.id ? styles.projectCardLabelActive : null]}>
              {getLocalizedProjectTitle(item, language)}
            </Text>
          </Pressable>
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
              <Text style={styles.text}>{getLocalizedField(item, 'body', language)}</Text>
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
        testID="messages-input"
        value={body}
        onChangeText={setBody}
        placeholder={t('messaging.typeMessage')}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      <PrimaryButton
        testID="messages-send"
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
  projectCard: {
    width: 220,
    minHeight: 124,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  projectCardActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  projectCardLabel: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  projectCardLabelActive: {
    color: colors.textInverse,
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
