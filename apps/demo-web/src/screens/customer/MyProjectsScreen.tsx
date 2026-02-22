import { useNavigate } from "react-router-dom";
import { FolderOpen, MapPin, ChevronRight, Shield } from "lucide-react";
import { useProjects } from "../../context/ProjectsContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { formatCurrency } from "../../utils/formatters";

export default function MyProjectsScreen() {
  const { projects } = useProjects();
  const { currentUser } = useAuth();
  const { t, locale } = useApp();
  const navigate = useNavigate();

  const myProjects = projects.filter((p) => p.customerId === currentUser?.id);
  const visibleProjects = myProjects.length ? myProjects : projects;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("projects.title")} />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {visibleProjects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title={t("projects.empty")}
            subtitle={t("projects.emptySub")}
            action={{ label: t("projects.postProject"), onClick: () => navigate("/projects/new") }}
          />
        ) : (
          visibleProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              data-testid={`projects-list-card-${project.id}`}
              className="w-full text-left pressable"
            >
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
              >
                {project.photos[0] && (
                  <img
                    src={project.photos[0]}
                    alt={project.title}
                    className="w-full h-28 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-[15px] truncate">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5 text-gray-400">
                        <MapPin size={11} />
                        <span className="text-[11px]">{project.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge status={project.status} size="xs" />
                      <ChevronRight size={14} className="text-gray-300" />
                    </div>
                  </div>

                  {/* Footer info */}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                    <span className="text-[11px] text-gray-400">
                      {t("projects.budget")}: <span className="font-semibold text-gray-600">{project.budget}</span>
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {project.quotes.length} {project.quotes.length !== 1 ? t("projects.quotes") : t("projects.quote")}
                    </span>
                    {project.escrowAmount && (
                      <div className="ml-auto flex items-center gap-1 text-teal-600">
                        <Shield size={11} />
                        <span className="text-[11px] font-bold">
                          {formatCurrency(project.escrowAmount, locale)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
