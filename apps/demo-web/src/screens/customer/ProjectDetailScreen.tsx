import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Shield, Star, MessageCircle } from "lucide-react";
import { useProjects } from "../../context/ProjectsContext";
import { useApp } from "../../context/AppContext";
import { findUserById } from "../../data/users";
import type { Contractor, Quote } from "../../types";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import ProgressStepper from "../../components/ui/ProgressStepper";
import Avatar from "../../components/ui/Avatar";
import { formatCurrency } from "../../utils/formatters";

const CATEGORY_TRANSLATION_KEY_BY_VALUE: Record<string, string> = {
  bathroom: "category.bathroom",
  kitchen: "category.kitchen",
  painting: "category.painting",
  hvac: "category.hvac",
  electrical: "category.electrical",
  plumbing: "category.plumbing",
  carpentry: "category.carpentry",
  tiling: "category.tiling",
  roofing: "category.roofing",
  other: "category.other",
};

export default function ProjectDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, acceptQuote } = useProjects();
  const { t, lang, locale } = useApp();
  const [showDeveloperActions, setShowDeveloperActions] = useState(false);

  const project = getProject(id ?? "");
  if (!project) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title={t("detail.projectTitle")} back />
        <div className="flex-1 flex items-center justify-center text-gray-400">{t("detail.projectNotFound")}</div>
      </div>
    );
  }

  const acceptedQuote = project.quotes.find((q) => q.id === project.acceptedQuoteId);
  const contractor = acceptedQuote
    ? (findUserById(acceptedQuote.contractorId, lang) as Contractor | null)
    : null;

  const handleAcceptQuote = (quoteId: string) => {
    void acceptQuote(project.id, quoteId);
    navigate(`/project/${project.id}/agreement`);
  };

  const categoryKey = CATEGORY_TRANSLATION_KEY_BY_VALUE[project.category.toLowerCase()];
  const categoryLabel = categoryKey ? t(categoryKey, project.category) : project.category;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={categoryLabel} back />

      <div className="flex-1 overflow-y-auto">
        {/* Hero photo */}
        {project.photos[0] && (
          <div className="relative">
            <img src={project.photos[0]} alt={project.title} className="w-full h-44 object-cover" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <Badge status={project.status} size="sm" />
            </div>
          </div>
        )}

        <div className="px-4 py-4 flex flex-col gap-4">
          {/* Title & meta */}
          <div>
            <h1 className="font-extrabold text-gray-900 text-[18px] leading-tight">{project.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span className="text-[12px]">{project.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span className="text-[12px]">{project.timeline}</span>
              </div>
            </div>
            <p className="text-[12px] text-gray-400 mt-1">{t("projects.budget")}: <span className="font-semibold text-gray-600">{project.budget}</span></p>
          </div>

          {/* Progress stepper */}
          <div
            className="bg-white rounded-2xl p-4"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            data-testid="project-detail-workflow-card"
          >
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">{t("detail.progress")}</p>
            <ProgressStepper status={project.status} />
            {project.status === "in_progress" && (
              <p
                className="text-[11px] text-blue-600 font-medium mt-2 text-center"
                data-testid="project-detail-workflow-state"
              >
                {t("detail.inProgress")}
              </p>
            )}
            {project.status === "complete_requested" && (
              <p
                className="text-[11px] text-purple-600 font-medium mt-2 text-center"
                data-testid="project-detail-workflow-state"
              >
                {t("detail.completionRequested")}
              </p>
            )}
            {project.status !== "in_progress" && project.status !== "complete_requested" && (
              <p
                className="text-[11px] text-gray-500 font-medium mt-2 text-center capitalize"
                data-testid="project-detail-workflow-state"
              >
                {t(`status.${project.status}`, project.status.replace("_", " "))}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t("detail.description")}</p>
            <p className="text-[13px] text-gray-600 leading-relaxed">{project.description}</p>
          </div>

          {/* Photos */}
          {project.photos.length > 1 && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">{t("detail.photos")}</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {project.photos.map((p, i) => (
                  <img key={i} src={p} alt="" className="h-28 w-40 object-cover rounded-xl flex-shrink-0" />
                ))}
              </div>
            </div>
          )}

          {/* Active contractor panel */}
          {contractor && acceptedQuote && (
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <div className="px-4 pt-4 pb-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">{t("detail.selectedContractor")}</p>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={contractor.avatarUrl} name={contractor.name} size="md" />
                  <div>
                    <p className="font-bold text-gray-900 text-[14px]">{contractor.businessName}</p>
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-amber-400" fill="#fbbf24" />
                      <span className="text-[12px] font-semibold text-gray-600">{contractor.rating}</span>
                      <span className="text-[11px] text-gray-400">· {contractor.completedJobs} {t("label.jobs").toLowerCase()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(contractor ? `/messages?contractor=${contractor.id}` : "/messages")}
                    data-testid="project-detail-open-messages"
                    className="ml-auto w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center pressable"
                  >
                    <MessageCircle size={16} className="text-teal-600" />
                  </button>
                </div>

                {/* Escrow summary */}
                <div className="bg-teal-50 rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-teal-700 font-medium">{t("detail.agreedAmount")}</span>
                    <span className="text-[14px] font-extrabold text-teal-800">{formatCurrency(acceptedQuote.amount, locale)}</span>
                  </div>
                  {project.trustvibeFee && (
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-teal-600">{t("detail.tvFee")}</span>
                      <span className="text-[12px] font-bold text-teal-700">–{formatCurrency(project.trustvibeFee, locale)}</span>
                    </div>
                  )}
                  {project.escrowAmount && project.trustvibeFee && (
                    <div className="flex items-center justify-between border-t border-teal-200 pt-1.5">
                      <span className="text-[11px] text-teal-700 font-semibold">{t("detail.contractorReceives")}</span>
                      <span className="text-[13px] font-extrabold text-teal-800">
                        {formatCurrency(project.escrowAmount - project.trustvibeFee, locale)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-teal-600 mb-3">
                  <Shield size={13} />
                  <span className="text-[11px] font-semibold">{t("detail.escrowNote")}</span>
                </div>
              </div>

              {/* Action buttons */}
              {project.status === "open" || project.status === "funded" ? (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => navigate(`/project/${project.id}/fund`)}
                    data-testid="project-detail-workflow-agreement"
                    className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-2xl text-sm pressable"
                  >
                    <Shield size={14} className="inline mr-2" />
                    {t("btn.fundEscrow")}
                  </button>
                </div>
              ) : project.status === "in_progress" ? (
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => navigate(contractor ? `/messages?contractor=${contractor.id}` : "/messages")}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-2xl text-sm pressable"
                  >
                    {t("detail.messageContractor")}
                  </button>
                </div>
              ) : project.status === "complete_requested" ? (
                <div className="px-4 pb-4 flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/project/${project.id}/release`)}
                    className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-2xl text-sm pressable"
                  >
                    ✓ {t("btn.approveRelease")}
                  </button>
                  <button
                    onClick={() => navigate(`/project/${project.id}/issue`)}
                    className="w-full bg-white border border-red-200 text-red-500 font-semibold py-3 rounded-2xl text-sm pressable"
                  >
                    {t("release.issueBtn")}
                  </button>
                </div>
              ) : project.status === "completed" ? (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => navigate(`/project/${project.id}/review`)}
                    className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-sm pressable"
                  >
                    ⭐ {t("btn.leaveReview")}
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Quotes list — only shown when open and no accepted quote */}
          {project.status === "open" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  {t("detail.quotes")} ({project.quotes.length})
                </p>
                <button
                  data-testid="project-detail-select-contractor"
                  className="text-teal-600 text-[11px] font-semibold"
                  onClick={() => navigate(`/project/${project.id}/quotes`)}
                >
                  {t("detail.selectContractor")}
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {project.quotes.map((q) => (
                  <QuoteCard
                    key={q.id}
                    quote={q}
                    testId={q.id}
                    onAccept={() => handleAcceptQuote(q.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <button
              data-testid="project-detail-toggle-developer-actions"
              className="text-[11px] font-bold text-gray-500"
              onClick={() => setShowDeveloperActions((current) => !current)}
            >
              {t("detail.developerActions")}
            </button>
            {showDeveloperActions ? (
              <div className="mt-3 flex flex-col gap-2">
                <p data-testid="project-detail-workflow-quote-amount" className="text-[12px] text-gray-600">
                  {t("detail.quoteAmount")} {acceptedQuote ? formatCurrency(acceptedQuote.amount, locale) : t("common.notAvailable")}
                </p>
                <p data-testid="project-detail-workflow-timeline" className="text-[12px] text-gray-600">
                  {t("detail.timeline")} {acceptedQuote?.timeline ?? project.timeline}
                </p>
                <button
                  data-testid="project-detail-create-estimate-deposit"
                  className="bg-teal-600 text-white rounded-xl px-3 py-2 text-[12px] font-semibold w-fit"
                >
                  {t("detail.createEstimateDeposit")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteCard({
  quote,
  onAccept,
  testId,
}: {
  quote: Quote;
  onAccept: () => void;
  testId: string;
}) {
  const { t, lang, locale } = useApp();
  const contractor = findUserById(quote.contractorId, lang) as Contractor | null;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      data-testid={`quote-card-${testId}`}
    >
      <div className="p-4">
        {contractor && (
          <div className="flex items-center gap-3 mb-3">
            <Avatar src={contractor.avatarUrl} name={contractor.name} size="sm" />
            <div>
              <p
                className="font-bold text-gray-900 text-[13px]"
                data-testid={`quote-contractor-${testId}`}
              >
                {contractor.businessName}
              </p>
              <div className="flex items-center gap-1">
                <Star size={10} className="text-amber-400" fill="#fbbf24" />
                <span className="text-[11px] text-gray-500">{contractor.rating} · {contractor.completedJobs} {t("label.jobs").toLowerCase()}</span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p
                className="text-[18px] font-extrabold text-gray-900"
                data-testid={`quote-price-${testId}`}
              >
                {formatCurrency(quote.amount, locale)}
              </p>
              <p className="text-[11px] text-gray-400" data-testid={`quote-timeline-${testId}`}>
                {quote.timeline}
              </p>
            </div>
          </div>
        )}

        {/* Line items */}
        <div className="bg-gray-50 rounded-xl p-3 mb-3">
          {quote.breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-0.5">
              <span className="text-[11px] text-gray-600">{item.label}</span>
              <span className="text-[11px] font-semibold text-gray-700">{formatCurrency(item.amount, locale)}</span>
            </div>
          ))}
        </div>

        {quote.notes && (
          <p
            className="text-[11px] text-gray-500 italic mb-3 leading-relaxed"
            data-testid={`quote-scope-${testId}`}
          >
            "{quote.notes}"
          </p>
        )}

        {quote.status === "pending" && (
          <button
            onClick={onAccept}
            data-testid={`quote-select-${testId}`}
            className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl text-sm pressable"
          >
            {t("btn.acceptQuote")}
          </button>
        )}
        {quote.status === "accepted" && (
          <div className="bg-emerald-50 text-emerald-700 font-semibold text-[12px] py-2 rounded-xl text-center">
            {t("detail.quoteAccepted")}
          </div>
        )}
        {quote.status === "rejected" && (
          <div className="bg-gray-50 text-gray-400 font-semibold text-[12px] py-2 rounded-xl text-center">
            {t("detail.notSelected")}
          </div>
        )}
      </div>
    </div>
  );
}
