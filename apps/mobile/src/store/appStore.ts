import { create } from 'zustand';
import * as Localization from 'expo-localization';
import { DEFAULT_FEATURE_FLAGS, type FeatureFlags, type Role } from '@trustvibe/shared';

export type AppRole = Role | null;

type AuthUser = {
  uid: string;
  email: string | null;
};

export type UserProfile = {
  id: string;
  role: Role;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
};

type AppState = {
  role: AppRole;
  language: 'en' | 'es';
  user: AuthUser | null;
  profile: UserProfile | null;
  featureFlags: FeatureFlags;
  setRole: (role: AppRole) => void;
  setLanguage: (language: 'en' | 'es') => void;
  setUser: (user: AuthUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setFeatureFlags: (featureFlags: FeatureFlags) => void;
  clearSession: () => void;
};

const initialLanguage: 'en' | 'es' = Localization.getLocales()[0]?.languageCode === 'es' ? 'es' : 'en';

export const useAppStore = create<AppState>((set) => ({
  role: null,
  language: initialLanguage,
  user: null,
  profile: null,
  featureFlags: DEFAULT_FEATURE_FLAGS,
  setRole: (role) => set({ role }),
  setLanguage: (language) => set({ language }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setFeatureFlags: (featureFlags) => set({ featureFlags }),
  clearSession: () =>
    set({
      role: null,
      user: null,
      profile: null,
      featureFlags: DEFAULT_FEATURE_FLAGS,
    }),
}));
