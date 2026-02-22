import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { enableDemoDataFallback, type DataMode } from "../config/runtime";
import { probeBackend } from "../services/api";

type RuntimeContextValue = {
  dataMode: DataMode;
  backendReachable: boolean;
  autoFallback: boolean;
  setDataMode: (mode: DataMode) => void;
  recheckBackend: () => Promise<boolean>;
};

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const [dataMode, setDataMode] = useState<DataMode>("live");
  const [backendReachable, setBackendReachable] = useState(true);
  const [autoFallback, setAutoFallback] = useState(false);

  const recheckBackend = useCallback(async (): Promise<boolean> => {
    const reachable = await probeBackend(3000);
    setBackendReachable(reachable);
    if (!reachable && enableDemoDataFallback) {
      setDataMode("mock");
      setAutoFallback(true);
    } else if (reachable && dataMode === "live") {
      setAutoFallback(false);
    }
    return reachable;
  }, [dataMode]);

  useEffect(() => {
    void recheckBackend();
  }, [recheckBackend]);

  const value = useMemo<RuntimeContextValue>(
    () => ({
      dataMode,
      backendReachable,
      autoFallback,
      setDataMode: (mode) => {
        setDataMode(mode);
        setAutoFallback(false);
      },
      recheckBackend,
    }),
    [autoFallback, backendReachable, dataMode, recheckBackend]
  );

  return (
    <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
  );
}

export function useRuntime() {
  const ctx = useContext(RuntimeContext);
  if (!ctx) {
    throw new Error("useRuntime must be used inside RuntimeProvider");
  }
  return ctx;
}
