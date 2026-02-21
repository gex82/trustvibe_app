import { useNavigate } from "react-router-dom";
import { Star, TrendingUp, ChevronRight, Shield, Hammer, Clock, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { useApp } from "../../context/AppContext";
import { EARNINGS } from "../../data/earnings";
import type { Contractor } from "../../types";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { formatCurrency } from "../../utils/formatters";

export default function ContractorHomeScreen() {
  const { currentUser } = useAuth();
  const { projects } = useProjects();
  const { t } = useApp();
  const navigate = useNavigate();

  const c = currentUser as Contractor;

  const activeJobsByIdentity = projects.filter(
    (p) =>
      (p.status === "in_progress" ||
        p.status === "funded" ||
        p.status === "complete_requested") &&
      p.quotes.some(
        (q) => q.contractorId === currentUser?.id && q.status === "accepted"
      )
  );
  const activeJobs =
    activeJobsByIdentity.length > 0
      ? activeJobsByIdentity
      : projects.filter((p) =>
          ["in_progress", "funded", "complete_requested"].includes(p.status)
        );

  const openProjectsByIdentity = projects.filter(
    (p) =>
      p.status === "open" &&
      !p.quotes.some((q) => q.contractorId === currentUser?.id)
  );
  const openProjects =
    openProjectsByIdentity.length > 0
      ? openProjectsByIdentity
      : projects.filter((p) => p.status === "open");

  const totalEarned = EARNINGS.filter((e) => e.status === "paid").reduce(
    (sum, e) => sum + e.netPaid,
    0
  );
  const heldAmount = EARNINGS.find((e) => e.status === "held")?.amount ?? 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("greeting.morning") : hour < 17 ? t("greeting.afternoon") : t("greeting.evening");

  return (
    <div className="h-full scroll-area bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-3 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/profile")}
            data-testid="home-profile-link"
            className="flex items-center gap-3 pressable text-left"
          >
            <div className="relative">
              <Avatar src={c.avatarUrl} name={c.name} size="md" />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-teal-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">{greeting}</p>
              <h1 className="text-[16px] font-bold text-gray-900">{c.businessName}</h1>
            </div>
          </button>
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center relative pressable">
            <Bell size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Performance strip */}
        <div className="flex gap-4 mt-3 bg-gray-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-amber-400" fill="#fbbf24" />
            <span className="font-bold text-gray-800 text-[14px]">{c.rating}</span>
            <span className="text-gray-400 text-[11px]">{t("chome.rating")}</span>
          </div>
          <div className="h-4 w-px bg-gray-200 self-center" />
          <div className="flex items-center gap-1.5">
            <Hammer size={13} className="text-teal-500" />
            <span className="font-bold text-gray-800 text-[14px]">{c.completedJobs}</span>
            <span className="text-gray-400 text-[11px]">{t("label.jobs").toLowerCase()}</span>
          </div>
          <div className="h-4 w-px bg-gray-200 self-center" />
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-emerald-500" />
            <span className="font-bold text-gray-800 text-[14px]">{c.reliabilityScore ?? 96}%</span>
            <span className="text-gray-400 text-[11px]">{t("chome.reliability")}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Earnings card */}
        <div
          className="rounded-2xl p-4 text-white"
          style={{ background: "linear-gradient(135deg, #0f766e, #0d9488, #14b8a6)" }}
        >
          <p className="text-teal-100 text-[11px] font-semibold uppercase tracking-wide mb-1">
            {t("chome.earningsOverview")}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[28px] font-extrabold">{formatCurrency(totalEarned)}</p>
              <p className="text-teal-100 text-[12px]">{t("chome.totalEarned")}</p>
            </div>
            <div className="text-right">
              <p className="text-[18px] font-bold">{formatCurrency(heldAmount)}</p>
              <div className="flex items-center gap-1 text-teal-200 justify-end">
                <Shield size={11} />
                <span className="text-[11px]">{t("chome.inEscrow")}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/earnings")}
            className="mt-3 bg-white/20 text-white text-[12px] font-semibold px-4 py-1.5 rounded-full pressable hover:bg-white/30 transition"
          >
            {t("chome.viewEarnings")}
          </button>
        </div>

        {/* Active Jobs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[13px] font-bold text-gray-700 uppercase tracking-wide">
              {t("label.activeJobs")}
            </h2>
            <button
              onClick={() => navigate("/jobs")}
              className="text-teal-600 text-xs font-semibold pressable"
            >
              {t("label.viewAll")}
            </button>
          </div>
          {activeJobs.length === 0 ? (
            <Card padding="sm" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Hammer size={18} className="text-gray-400" />
              </div>
              <p className="text-gray-400 text-[13px]">{t("chome.noActiveJobs")}</p>
            </Card>
          ) : (
            activeJobs.map((job) => (
              <Card
                key={job.id}
                padding="none"
                className="overflow-hidden mb-2"
                onClick={() => navigate(`/project/${job.id}/bid`)}
              >
                <div className="p-4 flex items-start gap-3">
                  {job.photos[0] && (
                    <img src={job.photos[0]} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-gray-900 text-[14px] truncate">{job.title}</h3>
                      <Badge status={job.status} size="xs" className="ml-2 flex-shrink-0" />
                    </div>
                    <p className="text-gray-400 text-[11px] mt-0.5">{job.location}</p>
                    {job.escrowAmount && (
                      <p className="text-teal-600 text-[12px] font-bold mt-1 flex items-center gap-1">
                        <Shield size={11} />
                        {formatCurrency(job.escrowAmount)} {t("chome.inEscrow")}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Open projects to quote on */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[13px] font-bold text-gray-700 uppercase tracking-wide">
              {t("chome.opportunities")}
            </h2>
            <button
              onClick={() => navigate("/browse")}
              className="text-teal-600 text-xs font-semibold pressable"
            >
              {t("chome.browseAll")}
            </button>
          </div>
          {openProjects.slice(0, 2).map((project) => (
            <Card
              key={project.id}
              padding="sm"
              className="flex items-center gap-3 mb-2 pressable"
              onClick={() => navigate(`/project/${project.id}/bid`)}
            >
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-teal-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-[13px] truncate">{project.title}</p>
                <p className="text-gray-400 text-[11px]">{project.location} · {t("projects.budget")}: {project.budget}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
            </Card>
          ))}
          {openProjects.length === 0 && (
            <Card padding="sm" className="text-center">
              <p className="text-gray-400 text-[13px]">{t("chome.noProjects")}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
