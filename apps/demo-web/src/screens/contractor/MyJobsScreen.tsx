import { useNavigate } from "react-router-dom";
import { Shield, Clock, ChevronRight, Briefcase } from "lucide-react";
import { useProjects } from "../../context/ProjectsContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { formatCurrency } from "../../utils/formatters";

export default function MyJobsScreen() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { currentUser } = useAuth();
  const { t, locale } = useApp();

  const myJobsByIdentity = projects.filter((p) =>
    p.quotes.some(
      (q) => q.contractorId === currentUser?.id && q.status === "accepted"
    )
  );
  const myJobs =
    myJobsByIdentity.length > 0
      ? myJobsByIdentity
      : projects.filter((p) =>
          ["in_progress", "funded", "complete_requested"].includes(p.status)
        );

  const pendingQuotesByIdentity = projects.filter((p) =>
    p.quotes.some(
      (q) => q.contractorId === currentUser?.id && q.status === "pending"
    )
  );
  const pendingQuotes =
    pendingQuotesByIdentity.length > 0
      ? pendingQuotesByIdentity
      : projects.filter((p) => p.status === "open");

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("jobs.title")} />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Active jobs */}
        <div>
          <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">
            {t("jobs.active")} ({myJobs.length})
          </h2>
          {myJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={t("jobs.noJobs")}
              subtitle={t("jobs.noJobsSub")}
              action={{ label: t("jobs.browseProjects"), onClick: () => navigate("/browse") }}
            />
          ) : (
            myJobs.map((job) => {
              const myQuote =
                job.quotes.find((q) => q.contractorId === currentUser?.id) ??
                job.quotes[0];
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl overflow-hidden mb-3 pressable cursor-pointer"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                  onClick={() => navigate(`/project/${job.id}/bid`)}
                >
                  {job.photos[0] && (
                    <img src={job.photos[0]} alt="" className="w-full h-28 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-[14px]">{job.title}</h3>
                        <p className="text-gray-400 text-[11px] mt-0.5">{job.location}</p>
                      </div>
                      <Badge status={job.status} size="xs" />
                    </div>
                    {myQuote && (
                      <div className="mt-3 flex items-center justify-between bg-teal-50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <Shield size={13} className="text-teal-500" />
                          <span className="text-[12px] text-teal-700 font-semibold">{t("jobs.yourQuote")}</span>
                        </div>
                        <span className="text-[14px] font-extrabold text-teal-800">
                          {formatCurrency(myQuote.amount, locale)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-end mt-2">
                      <ChevronRight size={14} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pending quotes */}
        {pendingQuotes.length > 0 && (
          <div>
            <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">
              {t("jobs.pending")} ({pendingQuotes.length})
            </h2>
            {pendingQuotes.map((project) => {
              const myQuote =
                project.quotes.find((q) => q.contractorId === currentUser?.id) ??
                project.quotes[0];
              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl p-4 mb-2 pressable cursor-pointer"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                  onClick={() => navigate(`/project/${project.id}/bid`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-[13px] truncate">
                        {project.title}
                      </h3>
                      <p className="text-gray-400 text-[11px]">{project.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Clock size={12} />
                        <span className="text-[11px] font-semibold">
                          {myQuote ? formatCurrency(myQuote.amount, locale) : "—"}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
