import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { useRuntime } from "../../context/RuntimeContext";

const DEMO_ACCOUNTS = [
  { label: "Maria", sublabelKey: "login.customer", email: "maria.rodriguez@trustvibe.test", password: "DemoCustomer!123", color: "bg-teal-500" },
  { label: "Juan", sublabelKey: "login.contractor", email: "juan.services@trustvibe.test", password: "DemoContractor!123", color: "bg-blue-500" },
  { label: "Admin", sublabelKey: "login.admin", email: "admin@trustvibe.test", password: "DemoAdmin!123", color: "bg-purple-500" },
];

export default function DevSwitcher() {
  const { t } = useApp();
  const { login, currentUser } = useAuth();
  const { dataMode, autoFallback, backendReachable, setDataMode, recheckBackend } =
    useRuntime();

  return (
    <div
      className="fixed z-50 flex flex-col gap-2"
      style={{ bottom: 32, right: 32 }}
    >
      {!backendReachable && (
        <div
          className="bg-amber-500/95 text-black rounded-2xl px-3 py-2 text-[11px] font-semibold max-w-[240px]"
          data-testid="demo-data-mode-banner"
        >
          {t("runtime.demoFallbackBanner")}
        </div>
      )}
      <div
        className="bg-black/80 backdrop-blur-sm rounded-2xl p-3 flex flex-col gap-2"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
      >
        <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest text-center mb-1">
          {t("runtime.switchRole")}
        </p>
        <div className="grid grid-cols-2 gap-1 mb-1">
          <button
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              dataMode === "live" ? "bg-teal-500 text-white" : "bg-white/10 text-white/70"
            }`}
            onClick={async () => {
              setDataMode("live");
              await recheckBackend();
            }}
            data-testid="demo-mode-live"
          >
            {t("runtime.live")}
          </button>
          <button
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              dataMode === "mock" ? "bg-amber-500 text-black" : "bg-white/10 text-white/70"
            }`}
            onClick={() => setDataMode("mock")}
            data-testid="demo-mode-mock"
          >
            {t("runtime.mock")}
          </button>
        </div>
        {autoFallback ? (
          <p className="text-amber-300 text-[10px] text-center">
            {t("runtime.autoFallbackEnabled")}
          </p>
        ) : null}
        {DEMO_ACCOUNTS.map((acc) => {
          const isActive = currentUser?.email === acc.email;
          return (
            <button
              key={acc.email}
              onClick={() => void login(acc.email, acc.password)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all pressable ${
                isActive
                  ? "bg-white/20 ring-1 ring-white/30"
                  : "hover:bg-white/10"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full ${acc.color} flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0`}
              >
                {acc.label[0]}
              </div>
              <div>
                <div className="text-white font-semibold text-[12px] leading-none">
                  {acc.label}
                </div>
                <div className="text-white/50 text-[10px] mt-0.5">{t(acc.sublabelKey)}</div>
              </div>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
