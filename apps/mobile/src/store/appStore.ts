import { create } from 'zustand';

export type AppRole = 'customer' | 'contractor' | null;

type AuthUser = {
  uid: string;
  email: string | null;
};

type AppState = {
  role: AppRole;
  language: 'en' | 'es';
  user: AuthUser | null;
  setRole: (role: AppRole) => void;
  setLanguage: (language: 'en' | 'es') => void;
  setUser: (user: AuthUser | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  role: null,
  language: 'en',
  user: null,
  setRole: (role) => set({ role }),
  setLanguage: (language) => set({ language }),
  setUser: (user) => set({ user }),
}));
