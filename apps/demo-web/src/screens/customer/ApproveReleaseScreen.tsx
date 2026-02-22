import { useParams, useNavigate } from "react-router-dom";
import { Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useProjects } from "../../context/ProjectsContext";
import { useApp } from "../../context/AppContext";
import { findUserById } from "../../data/users";
import type { Contractor } from "../../types";
import TopBar from "../../components/layout/TopBar";
import Avatar from "../../components/ui/Avatar";
import { formatCurrency } from "../../utils/formatters";

export default function ApproveReleaseScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, approveRelease, raiseIssue } = useProjects();
  const { t, lang, locale } = useApp();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<"approved" | "issue" | null>(null);

  const project = getProject(id ?? "");
  if (!project) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title={t("release.title")} back />
        <div className="flex-1 flex items-center justify-center text-gray-400">{t("detail.projectNotFound")}</div>
      </div>
    );
  }

  const acceptedQuote = project.quotes.find((q) => q.id === project.acceptedQuoteId);
  const contractor = acceptedQuote
    ? (findUserById(acceptedQuote.contractorId, lang) as Contractor | null)
    : null;

  const handleApprove = async () => {
    setLoading(true);
    await approveRelease(project.id);
    setDone("approved");
    setLoading(false);
  };

  const handleIssue = async () => {
    await raiseIssue(project.id);
    setDone("issue");
  };

  if (done === "approved") {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <TopBar title={t("release.successTitle")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 scale-in">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">{t("release.successTitle")}</h2>
          <p className="text-gray-500 text-[13px] leading-relaxed mb-2 max-w-xs">
            <span className="font-bold text-gray-700">{formatCurrency(project.escrowAmount ?? 0, locale)}</span> {t("release.successSub")} {contractor?.businessName ?? t("release.contractorFallback")}.
          </p>
          <p className="text-gray-400 text-[12px] mb-8">{t("release.fundsArrival")}</p>
          <button
            onClick={() => navigate(`/project/${project.id}/review`)}
            className="w-full bg-amber-500 text-white font-bold py-4 rounded-2xl text-[15px] pressable mb-3"
          >
            ⭐ {t("btn.leaveReview")}
          </button>
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-white border border-gray-200 text-gray-600 font-semibold py-3.5 rounded-2xl text-sm pressable"
          >
            {t("release.backHome")}
          </button>
        </div>
      </div>
    );
  }

  if (done === "issue") {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <TopBar title={t("release.issuedTitle")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 scale-in">
            <AlertTriangle size={44} className="text-amber-500" />
          </div>
          <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">{t("release.issuedTitle")}</h2>
          <p className="text-gray-500 text-[13px] leading-relaxed mb-6 max-w-xs">
            {t("release.issuedSub")}
          </p>
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl text-[15px] pressable"
          >
            {t("release.backHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("release.title")} back />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Contractor note */}
        {contractor && (
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={contractor.avatarUrl} name={contractor.name} size="md" />
              <div>
                <p className="font-bold text-gray-900 text-[14px]">{contractor.businessName}</p>
                <p className="text-emerald-600 text-[11px] font-semibold">{t("release.workComplete")}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[12px] text-gray-600 leading-relaxed italic">
                "{project.completionNote ?? t("release.defaultCompletionNote")}"
              </p>
            </div>
          </div>
        )}

        {/* Completion photos */}
        {project.completionPhotos && project.completionPhotos.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t("release.completionPhotos")}</p>
            <div className="grid grid-cols-2 gap-2">
              {project.completionPhotos.map((photo, i) => (
                <img key={i} src={photo} alt={`${t("release.completionPhotos")} ${i + 1}`} className="w-full h-28 object-cover rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* Escrow summary */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-teal-600" />
            <span className="font-bold text-teal-800 text-sm">{t("release.escrowSummary")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-teal-700">{t("release.heldInEscrow")}</span>
            <span className="text-[16px] font-extrabold text-teal-800">
              {formatCurrency(project.escrowAmount ?? 0, locale)}
            </span>
          </div>
          <p className="text-[11px] text-teal-600 mt-1.5 leading-relaxed">
            {t("release.releaseNote")} {contractor?.businessName ?? t("release.contractorFallback")}.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 pb-4">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl text-[15px] pressable disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              t("release.releasing")
            ) : (
              <>
                <CheckCircle size={18} />
                {t("release.approveBtn")} {formatCurrency(project.escrowAmount ?? 0, locale)}
              </>
            )}
          </button>
          <button
            onClick={handleIssue}
            className="w-full bg-white border border-red-200 text-red-500 font-semibold py-3.5 rounded-2xl text-sm pressable flex items-center justify-center gap-2"
          >
            <AlertTriangle size={15} />
            {t("release.issueBtn")}
          </button>
        </div>

        <p className="text-[10px] text-gray-400 text-center leading-relaxed pb-2">
          {t("release.issueNote")}
        </p>
      </div>
    </div>
  );
}
