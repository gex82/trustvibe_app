import { TrendingUp, Shield, DollarSign } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { EARNINGS } from "../../data/earnings";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function EarningsScreen() {
  const { t } = useApp();
  const paid = EARNINGS.filter((e) => e.status === "paid");
  const held = EARNINGS.filter((e) => e.status === "held");

  const totalNet = paid.reduce((sum, e) => sum + e.netPaid, 0);
  const totalFees = EARNINGS.reduce((sum, e) => sum + e.fee, 0);
  const totalGross = EARNINGS.reduce((sum, e) => sum + e.amount, 0);
  const heldAmount = held.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("earn.title")} />

      <div className="flex-1 overflow-y-auto">
        {/* Summary hero */}
        <div
          className="mx-4 mt-4 rounded-2xl p-5 text-white"
          style={{ background: "linear-gradient(135deg, #0f766e, #0d9488, #14b8a6)" }}
        >
          <p className="text-teal-100 text-[11px] font-semibold uppercase tracking-widest mb-1">
            {t("earn.totalEarned")}
          </p>
          <p className="text-[36px] font-extrabold">{formatCurrency(totalNet)}</p>
          <p className="text-teal-200 text-[12px] mt-1">{t("earn.afterFees")}</p>

          <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-[13px] font-bold">{formatCurrency(heldAmount)}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield size={11} className="text-teal-200" />
                <p className="text-teal-200 text-[11px]">{t("earn.inEscrow")}</p>
              </div>
            </div>
            <div>
              <p className="text-[13px] font-bold">{EARNINGS.length}</p>
              <p className="text-teal-200 text-[11px] mt-0.5">{t("earn.totalJobs")}</p>
            </div>
            <div>
              <p className="text-[13px] font-bold">{formatCurrency(totalFees)}</p>
              <p className="text-teal-200 text-[11px] mt-0.5">{t("earn.feesPaid")}</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 px-4 mt-3">
          <div className="flex-1 bg-white rounded-2xl p-3 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <DollarSign size={18} className="text-teal-500 mx-auto mb-1" />
            <p className="text-[14px] font-extrabold text-gray-900">{formatCurrency(totalGross)}</p>
            <p className="text-[10px] text-gray-400">{t("earn.grossGmv")}</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-3 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <TrendingUp size={18} className="text-emerald-500 mx-auto mb-1" />
            <p className="text-[14px] font-extrabold text-gray-900">
              {Math.round(((totalNet) / totalGross) * 100)}%
            </p>
            <p className="text-[10px] text-gray-400">{t("earn.netRate")}</p>
          </div>
        </div>

        {/* Transaction list */}
        <div className="px-4 mt-4 mb-4">
          <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-3">
            {t("earn.history")}
          </h2>
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            {EARNINGS.map((e, i) => (
              <div
                key={e.id}
                className={`px-4 py-3.5 ${i < EARNINGS.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-[13px] truncate">
                      {e.projectTitle}
                    </p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{e.customerName}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p
                      className={`text-[15px] font-extrabold ${
                        e.status === "held" ? "text-blue-600" : "text-emerald-600"
                      }`}
                    >
                      +{formatCurrency(e.netPaid)}
                    </p>
                    <Badge status={e.status} size="xs" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px] text-gray-400">{formatDate(e.paidAt)}</p>
                  <p className="text-[10px] text-gray-400">
                    {t("earn.fee")} {formatCurrency(e.fee)} · {t("earn.gross")} {formatCurrency(e.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
