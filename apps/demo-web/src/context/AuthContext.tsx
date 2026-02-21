import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DemoUser } from "../types";
import { findUserByCredentials } from "../data/users";
import {
  login as loginApi,
  logout as logoutApi,
} from "../services/api";
import { findDemoUserByEmail, mapProfileToDemoUser } from "../adapters/users";
import { useRuntime } from "./RuntimeContext";
import { enableDemoDataFallback } from "../config/runtime";
import { useApp } from "./AppContext";

interface AuthContextType {
  currentUser: DemoUser | null;
  hydrating: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { dataMode, setDataMode } = useRuntime();
  const { lang } = useApp();
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [hydrating, setHydrating] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (dataMode === "live") {
      try {
        await loginApi({ email, password });
        const matched = findDemoUserByEmail(email, lang);
        if (matched) {
          setCurrentUser({ ...matched });
        } else {
          setCurrentUser(mapProfileToDemoUser(null, email, lang));
        }
        setHydrating(false);
        return true;
      } catch {
        if (!enableDemoDataFallback) {
          return false;
        }
      }
    }

    const user = findUserByCredentials(email, password, lang);
    if (user) {
      if (dataMode === "live") {
        setDataMode("mock");
      }
      setCurrentUser(user);
      setHydrating(false);
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (dataMode === "live") {
      try {
        await logoutApi();
      } catch {
        // no-op in demo mode
      }
    }
    setCurrentUser(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({ currentUser, hydrating, login, logout }),
    [currentUser, hydrating, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
