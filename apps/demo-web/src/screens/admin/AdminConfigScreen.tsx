import { useEffect, useMemo, useState } from "react";
import TopBar from "../../components/layout/TopBar";
import Card from "../../components/ui/Card";
import { adminSetConfig, getCurrentConfig } from "../../services/api";
import { useRuntime } from "../../context/RuntimeContext";
import { useApp } from "../../context/AppContext";

export default function AdminConfigScreen() {
  const { dataMode } = useRuntime();
  const { t } = useApp();
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      try {
        const config = await getCurrentConfig();
        if (!mounted) return;
        setFlags({
          recommendationsEnabled: Boolean(config.featureFlags.recommendationsEnabled),
          growthEnabled: Boolean(config.featureFlags.growthEnabled),
          estimateDepositsEnabled: Boolean(config.featureFlags.estimateDepositsEnabled),
          reliabilityScoringEnabled: Boolean(
            config.featureFlags.reliabilityScoringEnabled
          ),
        });
      } catch (error) {
        setMessage(String(error));
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const keys = useMemo(() => Object.keys(flags), [flags]);

  const flagLabels = useMemo(
    () => ({
      recommendationsEnabled: t("admin.config.flagRecommendations"),
      growthEnabled: t("admin.config.flagGrowth"),
      estimateDepositsEnabled: t("admin.config.flagEstimateDeposits"),
      reliabilityScoringEnabled: t("admin.config.flagReliabilityScoring"),
    }),
    [t]
  );

  const save = async () => {
    if (dataMode === "mock") {
      setMessage(t("admin.config.mockNotPersisted"));
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      await adminSetConfig({ featureFlags: flags });
      setMessage(t("admin.config.saved"));
    } catch (error) {
      setMessage(String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("admin.nav.config")} back />
      <div className="px-4 py-4 flex flex-col gap-3">
        <Card>
          <p className="font-bold text-gray-800 text-[14px]">{t("admin.config.featureFlags")}</p>
          {loading ? <p className="text-gray-500 text-[12px] mt-2">{t("common.loading")}</p> : null}
          <div className="mt-2 flex flex-col gap-2">
            {keys.map((key) => (
              <label
                key={key}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2"
              >
                <span className="text-gray-700 text-[12px]">{flagLabels[key as keyof typeof flagLabels] ?? key}</span>
                <input
                  type="checkbox"
                  checked={Boolean(flags[key])}
                  onChange={(event) =>
                    setFlags((current) => ({
                      ...current,
                      [key]: event.target.checked,
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <button
            data-testid="config-save"
            className="mt-3 bg-teal-600 text-white rounded-xl px-4 py-2 text-[12px] font-semibold disabled:opacity-50"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? t("admin.config.saving") : t("admin.config.save")}
          </button>
          {message ? <p className="text-[12px] text-gray-500 mt-2">{message}</p> : null}
        </Card>
      </div>
    </div>
  );
}
