import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { listMessages, listProjects, sendMessage } from '../../services/api';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/tokens';

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
      Alert.alert(t('common.error'), String(error));
    },
  });

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('messaging.title')}</Text>
      {projectsQuery.isLoading ? <Text style={styles.text}>{t('common.loading')}</Text> : null}
      {projectsQuery.isError ? <Text style={styles.text}>{t('common.error')}</Text> : null}

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
        ListEmptyComponent={<Text style={styles.text}>{t('messaging.noProjects')}</Text>}
      />

      <FlatList
        data={messagesQuery.data?.messages ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text style={styles.messageMeta}>{item.senderId}</Text>
            <Text style={styles.text}>{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>{t('messaging.noMessages')}</Text>}
      />

      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder={t('messaging.attachImage')}
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
  title: {
    color: colors.textPrimary,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: '700',
  },
  text: {
    color: colors.textPrimary,
  },
  projects: {
    gap: 8,
    marginBottom: 12,
  },
  messages: {
    gap: 8,
    paddingBottom: 12,
  },
  messageBubble: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: 10,
  },
  messageMeta: {
    color: colors.textSecondary,
    marginBottom: 4,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    color: colors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
});
