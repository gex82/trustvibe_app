import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import type { HomeStackParamList } from '../../navigation/types';
import { db } from '../../services/firebase';
import { mapApiError } from '../../services/api';
import { pickDocument, uploadToStorage } from '../../services/upload';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<HomeStackParamList, 'Documents'>;

type DocItem = {
  id: string;
  name: string;
  url: string;
  status: 'pending_review' | 'verified' | 'Pending Review' | 'Verified';
};

export function DocumentsScreen(_: Props): React.JSX.Element {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const [items, setItems] = React.useState<DocItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data = snap.data() as any;
        setItems(Array.isArray(data?.documents) ? data.documents : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('profile.documents')}</Text>
      <PrimaryButton
        testID="documents-upload"
        label={uploading ? t('common.loading') : t('documents.upload')}
        disabled={uploading || !user?.uid}
        onPress={async () => {
          try {
            if (!user?.uid) {
              return;
            }
            const localUri = await pickDocument();
            if (!localUri) {
              return;
            }
            setUploading(true);
            const id = `doc-${Date.now()}`;
            const url = await uploadToStorage(localUri, `users/${user.uid}/documents/${id}`);
            const nextItems: DocItem[] = [
              {
                id,
                name: t('documents.documentName', { index: items.length + 1 }),
                url,
                status: 'pending_review',
              },
              ...items,
            ];
            setItems(nextItems);
            await setDoc(doc(db, 'users', user.uid), { documents: nextItems, updatedAt: new Date().toISOString() }, { merge: true });
          } catch (error) {
            Alert.alert(t('common.error'), mapApiError(error));
          } finally {
            setUploading(false);
          }
        }}
      />

      {loading ? <Text style={styles.meta}>{t('common.loading')}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.docRow}>
              <View style={styles.docMain}>
                <Text style={styles.docTitle}>{item.name}</Text>
                <Text testID={`documents-url-${item.id}`} style={styles.meta} numberOfLines={1}>
                  {item.url}
                </Text>
              </View>
              <Text style={item.status === 'Verified' || item.status === 'verified' ? styles.ok : styles.pending}>
                {item.status === 'Verified' || item.status === 'verified' ? t('documents.statusVerified') : t('documents.statusPending')}
              </Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState title={t('documents.emptyTitle')} description={t('documents.emptyDescription')} />}
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
    fontSize: 28,
    fontWeight: '800',
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  docMain: {
    flex: 1,
    gap: spacing.xs,
  },
  docTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  ok: {
    color: colors.success,
    fontWeight: '700',
  },
  pending: {
    color: colors.warning,
    fontWeight: '700',
  },
});
