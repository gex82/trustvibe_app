import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const { t, lang, setLang } = useApp();

  const DEMO_CHIPS = [
    {
      labelKey: "login.customer",
      name: "Maria Rodriguez",
      email: "maria.rodriguez@trustvibe.test",
      password: "DemoCustomer!123",
      color: "bg-teal-500",
    },
    {
      labelKey: "login.contractor",
      name: "Juan Reyes",
      email: "juan.services@trustvibe.test",
      password: "DemoContractor!123",
      color: "bg-blue-500",
    },
    {
      labelKey: "login.admin",
      name: "Admin",
      email: "admin@trustvibe.test",
      password: "DemoAdmin!123",
      color: "bg-purple-500",
    },
  ];
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(email.trim(), password);
    if (ok) {
      navigate("/home");
      return;
    }
    setError(t("login.error"));
    setLoading(false);
  };

  const fillDemo = (chip: { labelKey: string; name: string; email: string; password: string; color: string }) => {
    setEmail(chip.email);
    setPassword(chip.password);
    setError("");
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0f766e 0%, #0d9488 45%, #134e4a 100%)" }}
    >
      {/* Language toggle top */}
      <div className="flex justify-end px-5 pt-3">
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/30 text-white/80"
        >
          {lang === "en" ? "ES" : "EN"}
        </button>
      </div>

      {/* Hero area */}
      <div className="flex flex-col items-center pt-6 pb-6 px-6">
        <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
          <Shield size={34} className="text-white" fill="white" strokeWidth={0} />
        </div>
        <h1 className="text-white font-extrabold text-[26px] tracking-tight">TrustVibe</h1>
        <p className="text-teal-100 text-[13px] text-center mt-1 max-w-[220px] leading-relaxed">
          {t("login.tagline")}
        </p>
      </div>

      {/* Card */}
      <div
        className="flex-1 rounded-t-3xl bg-white px-5 pt-6 pb-4 flex flex-col gap-4 overflow-y-auto"
        style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.08)" }}
      >
        <h2 className="text-gray-800 font-bold text-xl">{t("login.welcome")}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              {t("login.email")}
            </label>
            <input
              data-testid="login-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              {t("login.password")}
            </label>
            <div className="relative">
              <input
                data-testid="login-password-input"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition pr-12"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="bg-red-50 border border-red-100 rounded-xl px-3 py-2"
              data-testid="login-error"
            >
              <p className="text-red-600 text-xs font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-2xl text-[15px] transition pressable mt-1 disabled:opacity-60"
          >
            {loading ? t("login.signingIn") : t("btn.signIn")}
          </button>
        </form>

        {/* Demo accounts */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 text-center mb-2.5">
            {t("login.demo")}
          </p>
          <div className="flex gap-2">
            {DEMO_CHIPS.map((chip) => (
              <button
                key={chip.email}
                onClick={() => fillDemo(chip)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border border-gray-100 pressable bg-gray-50 hover:bg-gray-100 transition`}
              >
                <div
                  className={`w-7 h-7 rounded-full ${chip.color} flex items-center justify-center text-white font-bold text-[11px]`}
                >
                  {t(chip.labelKey)[0].toUpperCase()}
                </div>
                <span className="text-[10px] font-semibold text-gray-500">
                  {t(chip.labelKey)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Trust note */}
        <div className="bg-teal-50 rounded-xl p-3 flex gap-2 items-start mt-1">
          <Shield size={14} className="text-teal-500 flex-shrink-0 mt-0.5" />
          <p className="text-teal-700 text-[11px] leading-relaxed">
            <strong>{t("login.trustNote")}</strong> {t("login.trustNoteSub")}
          </p>
        </div>
      </div>
    </div>
  );
}
