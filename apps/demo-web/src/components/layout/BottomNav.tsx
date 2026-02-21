import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import {
  Home,
  Search,
  FolderOpen,
  MessageCircle,
  Hammer,
  DollarSign,
  LayoutDashboard,
  Scale,
} from "lucide-react";

interface Tab {
  path: string;
  icon: React.ElementType;
  labelKey: string;
  testId: string;
  legacyTestId?: string;
}

const customerTabs: Tab[] = [
  { path: "/home", icon: Home, labelKey: "nav.home", testId: "tab-home" },
  { path: "/search", icon: Search, labelKey: "nav.explore", testId: "tab-search" },
  { path: "/projects", icon: FolderOpen, labelKey: "nav.projects", testId: "tab-projects" },
  {
    path: "/messages",
    icon: MessageCircle,
    labelKey: "nav.messages",
    testId: "tab-messages",
    legacyTestId: "tab-profile",
  },
];

const contractorTabs: Tab[] = [
  { path: "/home", icon: Home, labelKey: "nav.home", testId: "tab-home" },
  { path: "/browse", icon: Search, labelKey: "nav.browse", testId: "tab-search" },
  { path: "/jobs", icon: Hammer, labelKey: "nav.jobs", testId: "tab-projects" },
  {
    path: "/earnings",
    icon: DollarSign,
    labelKey: "nav.earnings",
    testId: "tab-earnings",
    legacyTestId: "tab-profile",
  },
  { path: "/messages", icon: MessageCircle, labelKey: "nav.messages", testId: "tab-messages" },
];

const adminTabs: Tab[] = [
  { path: "/admin", icon: LayoutDashboard, labelKey: "nav.dashboard", testId: "tab-admin-home" },
  { path: "/admin/projects", icon: FolderOpen, labelKey: "nav.projects", testId: "tab-admin-projects" },
  { path: "/admin/cases", icon: Scale, labelKey: "nav.cases", testId: "tab-admin-cases" },
];

export default function BottomNav() {
  const { currentUser } = useAuth();
  const { t } = useApp();

  const tabs =
    currentUser?.role === "contractor"
      ? contractorTabs
      : currentUser?.role === "admin"
      ? adminTabs
      : customerTabs;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-40 border-t border-gray-100"
      style={{
        height: 82,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex h-full items-start pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              data-testid={tab.testId}
              className={({ isActive }) =>
                `relative flex-1 flex flex-col items-center gap-[2px] py-1 transition-all duration-150 ${
                  isActive ? "text-teal-600" : "text-gray-400"
                }`
              }
              end={tab.path === "/admin"}
            >
              {({ isActive }) => (
                <>
                  {tab.legacyTestId ? (
                    <span data-testid={tab.legacyTestId} className="absolute inset-0" aria-hidden="true" />
                  ) : null}
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={isActive ? "text-teal-600" : "text-gray-400"}
                  />
                  <span
                    className={`text-[10px] font-medium ${
                      isActive ? "text-teal-600" : "text-gray-400"
                    }`}
                  >
                    {t(tab.labelKey)}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
