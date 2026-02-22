import { useNavigate } from "react-router-dom";
import { Bell, Search, Plus, FolderOpen, MessageCircle, Shield, ChevronRight, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { useApp } from "../../context/AppContext";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { formatCurrency, formatRelative } from "../../utils/formatters";

export default function CustomerHomeScreen() {
  const { currentUser, logout } = useAuth();
  const { projects } = useProjects();
  const { t, lang, locale, setLang } = useApp();
  const navigate = useNavigate();

  const ACTIVITY = [
    { id: "a1", icon: "💬", text: `Juan ${t("activity.messageSent")} ${t("activity.projectBathroom")}`, time: "2026-02-01T12:05:00", path: "/messages" },
    { id: "a2", icon: "✅", text: `${t("activity.escrowFunded")} $2,800 ${t("activity.heldSecurely")}`, time: "2026-01-15T09:00:00", path: "/project/proj-bathroom" },
    { id: "a3", icon: "📋", text: `Juan ${t("activity.quoteSubmitted")} ${t("activity.projectKitchen")}`, time: "2026-02-05T14:30:00", path: "/project/proj-kitchen" },
  ];

  const myProjects = projects.filter((p) => p.customerId === currentUser?.id);
  const visibleProjects = myProjects.length ? myProjects : projects;
  const activeProject = myProjects.find(
    (p) => p.status === "in_progress" || p.status === "funded" || p.status === "complete_requested"
  ) ?? visibleProjects.find(
    (p) => p.status === "in_progress" || p.status === "funded" || p.status === "complete_requested"
  );

  const firstName = currentUser?.name?.split(" ")[0] ?? t("home.fallbackName");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("greeting.morning") : hour < 17 ? t("greeting.afternoon") : t("greeting.evening");

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
            <Avatar src={currentUser?.avatarUrl} name={currentUser?.name ?? "M"} size="md" />
            <div>
              <p className="text-[11px] text-gray-400 font-medium">{greeting}</p>
              <h1 className="text-[17px] font-bold text-gray-900">{firstName} 👋</h1>
            </div>
          </button>
          <div className="flex items-center gap-2" data-testid="home-language-container">
            <button
              data-testid={lang === "en" ? "home-language-es" : "home-language-en"}
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="text-[11px] font-bold px-2 py-1 rounded-full border border-teal-200 text-teal-600 bg-teal-50 pressable"
            >
              {lang === "en" ? "ES" : "EN"}
            </button>
            <button
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center relative pressable"
              onClick={() => navigate("/notifications")}
            >
              <Bell size={18} className="text-gray-600" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              data-testid="home-quick-logout"
              onClick={() => void logout()}
              className="text-[11px] font-semibold text-gray-500 hover:text-red-500"
            >
              {t("admin.logout")}
            </button>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-3 bg-teal-50 rounded-xl px-3 py-2 flex items-center gap-2">
          <Shield size={14} className="text-teal-600" fill="#0d9488" strokeWidth={0} />
          <p className="text-teal-700 text-[11px] font-semibold">
            {myProjects.length} {myProjects.length !== 1 ? t("home.activeProtectedPlural") : t("home.activeProtected")} — {t("home.tvProtected")}
          </p>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Active Project Card */}
        {activeProject && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[13px] font-bold text-gray-700 uppercase tracking-wide">{t("home.activeProject")}</h2>
              <button onClick={() => navigate("/projects")} className="text-teal-600 text-xs font-semibold pressable">
                {t("home.viewAll")}
              </button>
            </div>
            <Card
              padding="none"
              onClick={() => navigate(`/project/${activeProject.id}`)}
              className="overflow-hidden"
              shadow="md"
            >
              {activeProject.photos[0] && (
                <img
                  src={activeProject.photos[0]}
                  alt={activeProject.title}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-[15px] truncate">{activeProject.title}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{activeProject.location}</p>
                  </div>
                  <Badge status={activeProject.status} size="xs" className="ml-2 flex-shrink-0" />
                </div>
                {activeProject.escrowAmount && (
                  <div className="mt-3 flex items-center justify-between bg-teal-50 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-[10px] text-teal-600 font-semibold uppercase">{t("home.inEscrow")}</p>
                        <p className="text-teal-800 font-bold text-[16px]">
                        {formatCurrency(activeProject.escrowAmount, locale)}
                        </p>
                    </div>
                    <Shield size={20} className="text-teal-500" />
                  </div>
                )}
                {activeProject.status === "complete_requested" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/project/${activeProject.id}/release`); }}
                    className="mt-3 w-full bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm pressable"
                  >
                    {t("home.approveCompletion")}
                  </button>
                )}
                <div className="flex items-center justify-end mt-2">
                  <span className="text-teal-600 text-xs font-semibold flex items-center gap-1">
                    {t("home.viewDetails")} <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">{t("home.quickActions")}</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Search, label: t("home.findContractors"), color: "bg-teal-50 text-teal-600", path: "/search" },
              { icon: Plus, label: t("home.newProject"), color: "bg-blue-50 text-blue-600", path: "/projects/new" },
              { icon: FolderOpen, label: t("home.myProjects"), color: "bg-amber-50 text-amber-600", path: "/projects" },
              { icon: MessageCircle, label: t("nav.messages"), color: "bg-purple-50 text-purple-600", path: "/messages" },
            ].map(({ icon: Icon, label, color, path }) => (
              <Card
                key={label}
                onClick={() => navigate(path)}
                padding="sm"
                className="flex items-center gap-3 pressable"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-[13px] font-semibold text-gray-700">{label}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2">
            {t("label.recentActivity")}
          </h2>
          <Card padding="none">
            {ACTIVITY.map((item, i) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                data-testid={`home-activity-${item.id}`}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left pressable ${
                  i < ACTIVITY.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-gray-700 leading-snug">{item.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {formatRelative(item.time, locale)}
                  </p>
                </div>
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-1" />
              </button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
