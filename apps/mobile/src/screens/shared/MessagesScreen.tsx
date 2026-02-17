import React from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useHeaderHeight } from '@react-navigation/elements';
import { listMessages, listProjects, mapApiError, sendMessage } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing } from '../../theme/tokens';
import { useAppStore } from '../../store/appStore';
import { getLocalizedField, getLocalizedProjectTitle } from '../../utils/localizedProject';

const PROJECTS_LIMIT = 50;
const MESSAGES_LIMIT = 100;

export function MessagesScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const headerHeight = useHeaderHeight();
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [body, setBody] = React.useState('');
  const trimmedBody = body.trim();

  const projectsQuery = useQuery({
    queryKey: ['messages-projects'],
    queryFn: () => listProjects({ limit: PROJECTS_LIMIT }),
  });

  React.useEffect(() => {
    if (!projectId && projectsQuery.data?.projects?.length) {
      setProjectId(projectsQuery.data.projects[0].id);
    }
  }, [projectId, projectsQuery.data?.projects]);

  const projects = projectsQuery.data?.projects ?? [];

  const messagesQuery = useQuery({
    queryKey: ['project-messages', projectId],
    queryFn: () => listMessages({ projectId: projectId as string, limit: MESSAGES_LIMIT }),
    enabled: Boolean(projectId),
  });
  const messages = messagesQuery.data?.messages ?? [];

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

  const handleSelectProject = React.useCallback((nextProjectId: string) => {
    setProjectId(nextProjectId);
  }, []);

  const handleSendMessage = React.useCallback(() => {
    if (!projectId) {
      return;
    }
    if (!trimmedBody) {
      return;
    }
    void sendMutation.mutateAsync({ projectId, body: trimmedBody });
  }, [projectId, sendMutation, trimmedBody]);

  const isSendDisabled = !projectId || !trimmedBody || sendMutation.isPending;

  const renderProjectItem = React.useCallback(
    ({ item }: { item: (typeof projects)[number] }) => (
      <Pressable
        testID={`messages-project-${item.id}`}
        style={[
          styles.projectCard,
          projectId === item.id ? styles.projectCardActive : null,
        ]}
        onPress={() => handleSelectProject(item.id)}
      >
        <Text numberOfLines={2} style={[styles.projectCardLabel, projectId === item.id ? styles.projectCardLabelActive : null]}>
          {getLocalizedProjectTitle(item, language)}
        </Text>
      </Pressable>
    ),
    [handleSelectProject, language, projectId]
  );

  const renderMessageItem = React.useCallback(
    ({ item }: { item: (typeof messages)[number] }) => (
      <Card>
        <View style={styles.messageBubble}>
          <Text style={styles.messageMeta}>{item.senderId}</Text>
          <Text style={styles.text}>{getLocalizedField(item, 'body', language)}</Text>
        </View>
      </Card>
    ),
    [language]
  );

  return (
    <ScreenContainer style={styles.wrap}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        <Text style={styles.title}>{t('messaging.title')}</Text>
        {projectsQuery.isError ? <Text style={styles.error}>{mapApiError(projectsQuery.error)}</Text> : null}

        <FlatList
          horizontal
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.projects}
          keyboardShouldPersistTaps="handled"
          renderItem={renderProjectItem}
          ListEmptyComponent={<EmptyState title={t('messaging.noProjects')} description={t('messaging.startConversationHint')} />}
        />

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messages}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          renderItem={renderMessageItem}
          ListEmptyComponent={
            messagesQuery.isLoading ? (
              <Text style={styles.text}>{t('common.loading')}</Text>
            ) : (
              <EmptyState title={t('messaging.noMessages')} description={t('messaging.firstMessageHint')} />
            )
          }
        />

        <View style={styles.composer}>
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
            disabled={isSendDisabled}
            onPress={handleSendMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  keyboardWrap: {
    flex: 1,
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
    paddingBottom: spacing.lg,
  },
  messagesList: {
    flex: 1,
  },
  messageBubble: {
    gap: spacing.xs,
  },
  composer: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
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
