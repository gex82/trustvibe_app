import {
  Scale,
  Clock,
  Shield,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../context/AppContext";
import TopBar from "../../components/layout/TopBar";
import { formatCurrency } from "../../utils/formatters";
import Card from "../../components/ui/Card";
import { useCollectionData } from "../../hooks/useCollectionData";
import { adminExecuteOutcome } from "../../services/api";
import { useRuntime } from "../../context/RuntimeContext";
import type { AdminCaseViewModel } from "../../types/adminCases";
import {
  buildOutcomePayload,
  formatCaseTestIdSuffix,
  isOpenStatus,
  isPendingStatus,
  isResolvedStatus,
  resolveAdminCases,
  type AdminCaseOutcomeAction,
} from "../../adapters/adminCases";

export default function AdminCasesScreen() {
  const { t } = useApp();
  const { dataMode } = useRuntime();
  const { rows, loading, error, refresh } = useCollectionData("cases", 80);

  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [resolutions, setResolutions] = useState<Record<string, AdminCaseOutcomeAction>>({});

  const shouldUseFallback =
    dataMode === "mock" || (!loading && (!rows.length || !!error));

  const cases = useMemo(() => {
    return resolveAdminCases(
      rows as Array<Record<string, unknown>>,
      t,
      shouldUseFallback
    );
  }, [rows, t, shouldUseFallback]);

  useEffect(() => {
    if (!expandedCase && cases.length > 0) {
      setExpandedCase(cases[0].id);
    }
  }, [cases, expandedCase]);

  const stats = useMemo(() => {
    let open = 0;
    let pending = 0;
    let resolved = 0;

    for (const item of cases) {
      const isResolved = Boolean(resolutions[item.id]) || isResolvedStatus(item.status);
      if (isResolved) {
        resolved += 1;
        continue;
      }
      if (isOpenStatus(item.status)) {
        open += 1;
      } else if (isPendingStatus(item.status)) {
        pending += 1;
      } else {
        open += 1;
      }
    }

    return { open, pending, resolved };
  }, [cases, resolutions]);

  const executeAction = async (
    caseItem: AdminCaseViewModel,
    action: AdminCaseOutcomeAction
  ) => {
    const actionLabel =
      action === "release"
        ? t("admin.cases.release")
        : action === "refund"
        ? t("admin.cases.refund")
        : t("admin.cases.split");

    if (dataMode === "mock") {
      setResolutions((prev) => ({ ...prev, [caseItem.id]: action }));
      setResult(`Mock mode: ${actionLabel} (${caseItem.id})`);
      return;
    }

    setBusyId(caseItem.id);
    setResult("");

    try {
      await adminExecuteOutcome(buildOutcomePayload(caseItem, action));
      setResolutions((prev) => ({ ...prev, [caseItem.id]: action }));
      setResult(`${actionLabel} (${caseItem.id})`);
      await refresh();
    } catch (err) {
      setResult(String(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("admin.cases.title")} back />

      <div className="flex gap-3 px-4 py-3">
        <div className="flex-1 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center">
          <p className="text-[18px] font-extrabold text-red-600">{stats.open}</p>
          <p className="text-[10px] text-red-500 font-medium">{t("admin.cases.open")}</p>
        </div>
        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-center">
          <p className="text-[18px] font-extrabold text-amber-600">{stats.pending}</p>
          <p className="text-[10px] text-amber-500 font-medium">{t("admin.cases.pending")}</p>
        </div>
        <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-center">
          <p className="text-[18px] font-extrabold text-emerald-600">{stats.resolved}</p>
          <p className="text-[10px] text-emerald-500 font-medium">{t("admin.cases.resolved")}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
        <Card>
          <p className="text-[12px] text-gray-500">
            {loading ? "Loading..." : `${cases.length} cases`}
          </p>
          {error && dataMode !== "mock" ? (
            <p className="text-[12px] text-red-600 mt-1">{error}</p>
          ) : null}
          {shouldUseFallback ? (
            <p className="text-[12px] text-amber-700 mt-1">
              Demo fallback cases are shown for a stable walkthrough.
            </p>
          ) : null}
          {result ? (
            <p
              data-testid="case-result-banner"
              className="text-[12px] text-emerald-700 mt-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2"
            >
              {result}
            </p>
          ) : null}
        </Card>

        <div data-testid="cases-table">
          <div data-testid="cases-card-list" className="flex flex-col gap-3">
            {cases.map((caseItem) => {
              const suffix = formatCaseTestIdSuffix(caseItem.id);
              const isExpanded = expandedCase === caseItem.id;
              const resolution = resolutions[caseItem.id];
              const isResolved = Boolean(resolution) || isResolvedStatus(caseItem.status);

              const statusBadgeClass = isResolved
                ? "bg-emerald-100 text-emerald-600"
                : isOpenStatus(caseItem.status)
                ? "bg-red-100 text-red-600"
                : "bg-amber-100 text-amber-600";

              const statusLabel = isResolved
                ? t("admin.cases.resolved")
                : isOpenStatus(caseItem.status)
                ? t("admin.cases.open")
                : t("admin.cases.pendingResolution");

              return (
                <div
                  key={caseItem.id}
                  data-testid={`case-card-${suffix}`}
                  className="bg-white rounded-2xl overflow-hidden"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                >
                  <button
                    data-testid={`case-expand-${suffix}`}
                    className="w-full px-4 py-4 text-left pressable"
                    onClick={() => setExpandedCase(isExpanded ? null : caseItem.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass}`}
                          >
                            {statusLabel}
                          </span>
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock size={10} />
                            <span className="text-[10px]">
                              {caseItem.daysOpen} {t("admin.cases.days")}
                            </span>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 text-[14px]">{caseItem.title}</p>
                        <p className="text-gray-400 text-[11px]">
                          {caseItem.customerName} vs {caseItem.contractorName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-[15px] font-extrabold text-gray-800">
                          {formatCurrency(caseItem.amountCents / 100)}
                        </p>
                        <div className="flex items-center gap-1 text-teal-600">
                          <Shield size={11} />
                          <span className="text-[10px] font-semibold">{t("admin.cases.inHold")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-1">
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded ? (
                    <div className="border-t border-gray-100 px-4 py-4">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                        {t("admin.cases.summary")}
                      </p>
                      <p className="text-[12px] text-gray-600 leading-relaxed mb-4">
                        {caseItem.summary}
                      </p>

                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                        {t("admin.cases.evidence")}
                      </p>
                      <div className="flex flex-col gap-1.5 mb-4">
                        {caseItem.evidence.length === 0 ? (
                          <div className="bg-gray-50 rounded-xl px-3 py-2 text-[12px] text-gray-500">
                            No evidence items attached.
                          </div>
                        ) : (
                          caseItem.evidence.map((item) => (
                            <div
                              key={`${caseItem.id}-${item}`}
                              className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2"
                            >
                              <CheckCircle size={12} className="text-teal-500" />
                              <span className="text-[12px] text-gray-600">{item}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {caseItem.resolutionSummary ? (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                          <p className="text-[11px] font-bold text-amber-700 mb-1">
                            {t("admin.cases.adminNote")}
                          </p>
                          <p className="text-[12px] text-amber-600 leading-relaxed">
                            {caseItem.resolutionSummary}
                          </p>
                        </div>
                      ) : null}

                      {isResolved ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                          <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-emerald-800 text-[13px]">
                              {resolution === "release" && t("admin.cases.release")}
                              {resolution === "refund" && t("admin.cases.refund")}
                              {resolution === "split" && t("admin.cases.split")}
                              {!resolution && t("admin.cases.resolved")}
                            </p>
                            <p className="text-emerald-600 text-[11px] mt-0.5">
                              {t("admin.cases.resolved")} - {formatCurrency(caseItem.amountCents / 100)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            data-testid={`case-action-release-${suffix}`}
                            onClick={() => void executeAction(caseItem, "release")}
                            className="flex-1 bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-[12px] pressable disabled:opacity-50"
                            disabled={busyId === caseItem.id}
                          >
                            {t("admin.cases.release")}
                          </button>
                          <button
                            data-testid={`case-action-refund-${suffix}`}
                            onClick={() => void executeAction(caseItem, "refund")}
                            className="flex-1 bg-red-50 border border-red-200 text-red-600 font-semibold py-2.5 rounded-xl text-[12px] pressable disabled:opacity-50"
                            disabled={busyId === caseItem.id}
                          >
                            {t("admin.cases.refund")}
                          </button>
                          <button
                            data-testid={`case-action-split-${suffix}`}
                            onClick={() => void executeAction(caseItem, "split")}
                            className="flex-1 bg-amber-50 border border-amber-200 text-amber-600 font-semibold py-2.5 rounded-xl text-[12px] pressable disabled:opacity-50"
                            disabled={busyId === caseItem.id}
                          >
                            {t("admin.cases.split")}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {cases.length === 0 && !loading ? (
              <Card>
                <p className="text-gray-500 text-[12px]">No cases found.</p>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
