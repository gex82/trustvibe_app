import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

async function toBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

export async function pickImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
  });
  if (result.canceled || !result.assets.length) {
    return null;
  }
  return result.assets[0].uri;
}

export async function pickDocument(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets.length) {
    return null;
  }
  return result.assets[0].uri;
}

export async function uploadToStorage(localUri: string, storagePath: string): Promise<string> {
  const blob = await toBlob(localUri);
  const objectRef = ref(storage, storagePath);
  await uploadBytes(objectRef, blob);
  return getDownloadURL(objectRef);
}
