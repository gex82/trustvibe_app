import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, ChevronRight, FileText } from "lucide-react";
import { useProjects } from "../../context/ProjectsContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import TopBar from "../../components/layout/TopBar";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";

export default function BrowseProjectsScreen() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { currentUser } = useAuth();
  const { t } = useApp();
  const [activeCategory, setActiveCategory] = useState("all");

  const CATEGORIES = [
    { key: "all", label: t("category.all") },
    { key: "bathroom", label: t("category.bathroom") },
    { key: "kitchen", label: t("category.kitchen") },
    { key: "painting", label: t("category.painting") },
    { key: "hvac", label: t("category.hvac") },
    { key: "electrical", label: t("category.electrical") },
    { key: "plumbing", label: t("category.plumbing") },
  ];

  const openProjects = projects.filter(
    (p) => p.status === "open" || p.status === "draft"
  );

  const filtered =
    activeCategory === "all"
      ? openProjects
      : openProjects.filter(
          (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("browse.title")} />

      {/* Category chips */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b border-gray-100">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition pressable ${
              activeCategory === cat.key
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="px-4 py-2 bg-white border-b border-gray-50">
        <p className="text-[11px] text-gray-400 font-medium">
          {filtered.length} {filtered.length !== 1 ? t("browse.availablePlural") : t("browse.available")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t("browse.noProjects")}
            subtitle={t("browse.noProjectsSub")}
          />
        ) : (
          filtered.map((project) => {
            const hasQuoted = project.quotes.some(
              (q) => q.contractorId === currentUser?.id
            );
            return (
              <button
                key={project.id}
                onClick={() => navigate(`/project/${project.id}/bid`)}
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
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge status={project.status} size="xs" />
                          {hasQuoted && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                              {t("browse.youQuoted")}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-[15px]">
                          {project.title}
                        </h3>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                    </div>

                    <p className="text-gray-500 text-[12px] mt-1.5 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin size={11} />
                        <span className="text-[11px]">{project.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock size={11} />
                        <span className="text-[11px]">{project.timeline}</span>
                      </div>
                      <div className="ml-auto">
                        <span className="text-[12px] font-bold text-teal-700">
                          {project.budget}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400">
                        {project.quotes.length} {project.quotes.length !== 1 ? t("projects.quotes") : t("projects.quote")} {t("browse.submitted")}
                      </span>
                      <span className="text-[11px] font-semibold text-teal-600">
                        {t("browse.viewQuote")}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
