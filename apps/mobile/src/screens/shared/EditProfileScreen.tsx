import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Avatar } from '../../components/Avatar';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { HomeStackParamList } from '../../navigation/types';
import { db } from '../../services/firebase';
import { mapApiError } from '../../services/api';
import { pickImage, uploadToStorage } from '../../services/upload';
import { useAppStore } from '../../store/appStore';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<HomeStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const [name, setName] = React.useState(profile?.name ?? '');
  const [phone, setPhone] = React.useState(profile?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(profile?.avatarUrl);
  const [saving, setSaving] = React.useState(false);

  return (
    <ScreenContainer style={styles.wrap}>
      <Text style={styles.title}>{t('profile.edit')}</Text>
      <View style={styles.avatarWrap}>
        <Avatar name={name || profile?.name} uri={avatarUrl} size={88} />
        <PrimaryButton
          testID="edit-profile-upload-avatar"
          label={t('profile.uploadPhoto')}
          variant="secondary"
          onPress={async () => {
            try {
              if (!user?.uid) {
                return;
              }
              const uri = await pickImage();
              if (!uri) {
                return;
              }
              const uploaded = await uploadToStorage(uri, `users/${user.uid}/avatar.jpg`);
              setAvatarUrl(uploaded);
            } catch (error) {
              Alert.alert(t('common.error'), mapApiError(error));
            }
          }}
        />
      </View>
      <FormInput testID="edit-profile-name-input" containerTestID="edit-profile-name-field" label={t('profile.name')} value={name} onChangeText={setName} iconName="person-outline" />
      <FormInput testID="edit-profile-phone-input" containerTestID="edit-profile-phone-field" label={t('profile.phone')} value={phone} onChangeText={setPhone} iconName="call-outline" />
      <FormInput testID="edit-profile-email-input" containerTestID="edit-profile-email-field" label={t('auth.email')} value={profile?.email ?? user?.email ?? ''} editable={false} iconName="mail-outline" />
      <PrimaryButton
        testID="edit-profile-save"
        label={saving ? t('common.loading') : t('common.save')}
        disabled={saving || !user?.uid}
        onPress={async () => {
          if (!user?.uid) {
            return;
          }
          setSaving(true);
          try {
            await setDoc(
              doc(db, 'users', user.uid),
              {
                name: name || profile?.name || '',
                phone: phone || null,
                avatarUrl: avatarUrl ?? null,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
            setProfile(
              profile
                ? {
                    ...profile,
                    name: name || profile.name,
                    phone: phone || undefined,
                    avatarUrl,
                  }
                : null
            );
            navigation.goBack();
          } catch (error) {
            Alert.alert(t('common.error'), mapApiError(error));
          } finally {
            setSaving(false);
          }
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
    fontSize: 28,
    fontWeight: '800',
  },
  avatarWrap: {
    gap: spacing.sm,
    alignItems: 'center',
  },
});
