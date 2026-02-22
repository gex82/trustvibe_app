import { Link } from "react-router-dom";
import { Users, FolderOpen, Scale, Shield, TrendingUp, ChevronRight, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { useApp } from "../../context/AppContext";
import TopBar from "../../components/layout/TopBar";
import Avatar from "../../components/ui/Avatar";
import { formatCurrency } from "../../utils/formatters";

export default function AdminDashboardScreen() {
  const { currentUser, logout } = useAuth();
  const { projects } = useProjects();
  const { t, locale } = useApp();

  const ACTIVITY_LOG = [
    { id: 1, icon: "✅", text: `${t("admin.activity.escrowReleased")} Bathroom Renovation ($2,604 ${t("admin.activity.toContractor")} Juan)`, time: `2 ${t("admin.activity.hoursAgo")}` },
    { id: 2, icon: "🔍", text: `${t("admin.activity.credentialRequest")} Rosa Morales (${t("admin.activity.licenseLabel")} #PR-CONT-3142)`, time: `4 ${t("admin.activity.hoursAgo")}` },
    { id: 3, icon: "⚠️", text: `${t("admin.activity.caseEscalated")} Exterior Paint ${t("admin.activity.disputeInHold")} $3,200 ${t("admin.activity.inHold")}`, time: t("admin.activity.dayAgo") },
    { id: 4, icon: "👤", text: `${t("admin.activity.newContractor")} Carlos Vega (${t("category.electrical")})`, time: `2 ${t("admin.activity.daysAgo")}` },
    { id: 5, icon: "☀️", text: t("admin.activity.solarQuote"), time: `2 ${t("admin.activity.hoursAgo")}` },
  ];

  const totalEscrow = projects
    .filter((p) => p.escrowAmount && (p.status === "in_progress" || p.status === "funded" || p.status === "complete_requested"))
    .reduce((sum, p) => sum + (p.escrowAmount ?? 0), 0);

  const openCases = projects.filter((p) => p.status === "disputed").length + 1;

  const stats = [
    { label: t("admin.projects.title"), value: projects.length + 2, icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-50" },
    { label: t("label.escrow"), value: projects.filter((p) => p.status === "in_progress" || p.status === "funded").length, icon: Shield, color: "text-teal-500", bg: "bg-teal-50" },
    { label: t("admin.casesNav"), value: openCases, icon: Scale, color: "text-red-500", bg: "bg-red-50" },
    { label: t("label.badges"), value: 28, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <TopBar title={t("admin.title")} />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Admin identity */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <Avatar src={currentUser?.avatarUrl} name={currentUser?.name ?? "A"} size="md" />
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-[14px]">{currentUser?.name}</p>
            <p className="text-[11px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
              {t("admin.administrator")}
            </p>
          </div>
          <button
            onClick={() => {
              void logout();
            }}
            className="text-xs text-gray-400 font-medium pressable hover:text-red-500 transition"
          >
            {t("admin.logout")}
          </button>
        </div>

        {/* Escrow total */}
        <div
          className="rounded-2xl p-4 text-white"
          style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)" }}
        >
          <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wide mb-1">
            {t("admin.totalEscrow")}
          </p>
          <p className="text-[30px] font-extrabold">{formatCurrency(totalEscrow + 2800, locale)}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={13} className="text-blue-300" />
            <p className="text-blue-200 text-[12px]">{t("admin.platformWide")}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-[22px] font-extrabold text-gray-900">{value}</p>
              <p className="text-[11px] text-gray-400 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div className="bg-white rounded-2xl overflow-hidden flex flex-col" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {[
            { label: t("admin.nav.users"), path: "/admin/users", icon: Users, testId: "admin-nav-users" },
            { label: t("admin.viewProjects"), path: "/admin/projects", icon: FolderOpen, testId: "admin-nav-projects" },
            { label: t("admin.casesNav"), path: "/admin/cases", icon: Scale, testId: "admin-nav-cases" },
            { label: t("admin.nav.deposits"), path: "/admin/deposits", icon: Shield, testId: "admin-nav-deposits" },
            { label: t("admin.nav.reliability"), path: "/admin/reliability", icon: TrendingUp, testId: "admin-nav-reliability" },
            { label: t("admin.nav.subscriptions"), path: "/admin/subscriptions", icon: Users, testId: "admin-nav-subscriptions" },
            { label: t("admin.nav.concierge"), path: "/admin/concierge", icon: AlertCircle, testId: "admin-nav-concierge" },
            { label: t("admin.nav.reviews"), path: "/admin/reviews", icon: Users, testId: "admin-nav-reviews" },
            { label: t("admin.nav.config"), path: "/admin/config", icon: Shield, testId: "admin-nav-config" },
          ].map(({ label, path, icon: Icon, testId }) => (
            <Link
              key={path}
              to={path}
              data-testid={testId}
              className="block w-full flex items-center gap-3 px-4 py-4 border-b border-gray-50 last:border-0 text-left pressable hover:bg-gray-50 transition"
            >
              <Icon size={18} className="text-gray-400" />
              <span className="flex-1 font-semibold text-gray-700 text-[13px]">{label}</span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          ))}
        </div>

        {/* Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 text-[13px]">{t("admin.alert")}</p>
            <p className="text-amber-600 text-[11px] mt-0.5">
              {t("admin.alertSub")}
            </p>
          </div>
        </div>

        {/* Activity log */}
        <div>
          <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-2">
            {t("admin.activityLog")}
          </h2>
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            {ACTIVITY_LOG.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 px-4 py-3 ${i < ACTIVITY_LOG.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <span className="text-[16px] flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-[12px] text-gray-700 leading-snug">{item.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
