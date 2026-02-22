import { useParams, useNavigate } from "react-router-dom";
import { Shield, CreditCard, CheckCircle, Lock } from "lucide-react";
import { useState } from "react";
import { useProjects } from "../../context/ProjectsContext";
import { useApp } from "../../context/AppContext";
import TopBar from "../../components/layout/TopBar";
import TrustBadge from "../../components/ui/TrustBadge";
import { formatCurrency } from "../../utils/formatters";

export default function FundEscrowScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, fundEscrow } = useProjects();
  const { t, locale } = useApp();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const project = getProject(id ?? "");
  if (!project) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title={t("fund.title")} back />
        <div className="flex-1 flex items-center justify-center text-gray-400">{t("detail.projectNotFound")}</div>
      </div>
    );
  }

  const amount = project.escrowAmount ?? 0;
  const fee = project.trustvibeFee ?? Math.round(amount * 0.07);
  const total = amount + fee;

  const handleConfirm = async () => {
    setLoading(true);
    await fundEscrow(project.id);
    setConfirmed(true);
    setLoading(false);
  };

  if (confirmed) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <TopBar title={t("fund.success.title")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 scale-in">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">{t("fund.success.title")}</h2>
          <p className="text-gray-500 text-[13px] leading-relaxed mb-6 max-w-xs">
            <span className="font-bold text-gray-700">{formatCurrency(amount, locale)}</span> {t("fund.success.sub")}
          </p>
          <div className="w-full bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-teal-600" />
              <span className="font-bold text-teal-800 text-sm">{t("fund.protected")}</span>
            </div>
            <p className="text-teal-600 text-[12px] leading-relaxed">
              {t("fund.protectedSub")}
            </p>
          </div>
          <button
            onClick={() => navigate(`/project/${project.id}`)}
            className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl text-[15px] pressable"
          >
            {t("fund.viewProject")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("fund.title")} back />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Trust badge */}
        <TrustBadge />

        {/* Payment summary */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">{t("fund.summary")}</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-600">{project.title}</span>
              <span className="text-[14px] font-bold text-gray-800">{formatCurrency(amount, locale)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-[12px] text-gray-500">{t("fund.tvFee")}</span>
                <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center cursor-help">
                  <span className="text-[9px] text-gray-500 font-bold">i</span>
                </div>
              </div>
              <span className="text-[13px] font-semibold text-gray-600">{formatCurrency(fee, locale)}</span>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
            <span className="text-[14px] font-bold text-gray-800">{t("label.totalCharged")}</span>
            <span className="text-[20px] font-extrabold text-teal-700">{formatCurrency(total, locale)}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{t("fund.escrowNote")}</p>
        </div>

        {/* Guarantees */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">{t("fund.guarantees")}</p>
          <div className="flex flex-col gap-2.5">
            {[
              t("escrow.guarantee1"),
              t("escrow.guarantee2"),
              t("escrow.guarantee3"),
              t("escrow.guarantee4"),
            ].map((g, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle size={12} className="text-teal-600" />
                </div>
                <p className="text-[12px] text-gray-600 leading-snug">{g}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t("fund.paymentMethod")}</p>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3">
            <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-purple-500 rounded-md flex items-center justify-center">
              <CreditCard size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-700">{t("fund.cardEnding")}</p>
              <p className="text-[11px] text-gray-400">{t("fund.cardExpires")}</p>
            </div>
            <div className="ml-auto">
              <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                <CheckCircle size={10} className="text-white" fill="white" strokeWidth={0} />
              </div>
            </div>
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={loading}
          data-testid="fund-escrow-confirm"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl text-[15px] pressable disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            t("fund.processing")
          ) : (
            <>
              <Lock size={16} />
              {t("fund.confirmBtn")} {formatCurrency(total, locale)}
            </>
          )}
        </button>

        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          {t("fund.terms")}
        </p>
      </div>
    </div>
  );
}
