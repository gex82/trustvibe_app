import { Bell, FileText, History, Settings, Wallet } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../../components/layout/TopBar";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { getContractors } from "../../data/users";
import { formatCurrency } from "../../utils/formatters";

function Placeholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={title} back />
      <div className="px-4 py-4">
        <Card>
          <p className="font-bold text-gray-900 text-[14px]">{title}</p>
          <p className="text-gray-500 text-[12px] mt-1">{subtitle}</p>
        </Card>
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const { currentUser, logout } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <TopBar title={t("workflow.profile.title")} />
        <div className="flex-1 p-4">
          <EmptyState
            icon={FileText}
            title={t("workflow.profile.noSessionTitle")}
            subtitle={t("workflow.profile.noSessionSubtitle")}
          />
        </div>
      </div>
    );
  }

  const actions = [
    {
      id: "profile-edit",
      label: t("workflow.profile.editProfile"),
      path: "/profile/edit",
    },
    {
      id: "profile-documents",
      label: t("workflow.profile.documents"),
      path: "/profile/documents",
    },
    {
      id: "profile-history",
      label: t("workflow.profile.history"),
      path: "/history",
    },
    {
      id: "profile-messages",
      label: t("workflow.profile.messages"),
      path: "/messages",
    },
    {
      id: "profile-recommendations",
      label: t("workflow.profile.recommendations"),
      path: "/recommendations",
    },
    {
      id: "profile-notifications",
      label: t("workflow.profile.notifications"),
      path: "/notifications",
    },
    {
      id: "profile-payment-methods",
      label: t("workflow.profile.paymentMethods"),
      path: "/payment-methods",
    },
    {
      id: "profile-settings",
      label: t("workflow.profile.settings"),
      path: "/settings",
    },
  ];

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("workflow.profile.title")} />
      <div className="px-4 py-4 flex flex-col gap-3">
        <Card>
          <p className="font-extrabold text-gray-900 text-[16px]">{currentUser.name}</p>
          <p className="text-gray-500 text-[12px]">{currentUser.email}</p>
          <p className="text-gray-500 text-[12px] capitalize mt-1">
            {t(`workflow.profile.role.${currentUser.role}`)}
          </p>
        </Card>
        {actions.map((action) => (
          <button
            key={action.id}
            data-testid={action.id}
            onClick={() => navigate(action.path)}
            className="w-full text-left bg-white rounded-2xl px-4 py-3 font-semibold text-gray-700 pressable"
          >
            {action.label}
          </button>
        ))}
        {currentUser.role === "contractor" && (
          <button
            data-testid="profile-earnings"
            onClick={() => navigate("/earnings")}
            className="w-full text-left bg-white rounded-2xl px-4 py-3 font-semibold text-gray-700 pressable"
          >
            {t("nav.earnings")}
          </button>
        )}
        <button
          data-testid="profile-logout"
          onClick={() => void logout()}
          className="w-full text-left bg-red-50 rounded-2xl px-4 py-3 font-semibold text-red-600 pressable"
        >
          {t("admin.logout")}
        </button>
      </div>
    </div>
  );
}

export function EditProfileScreen() {
  const { t } = useApp();

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("workflow.edit.title")} back />
      <div className="px-4 py-4">
        <Card className="flex flex-col gap-3">
          <p className="font-bold text-gray-900 text-[14px]">{t("workflow.edit.editorTitle")}</p>
          <p className="text-gray-500 text-[12px]">
            {t("workflow.edit.editorSubtitle")}
          </p>
          <button
            data-testid="edit-profile-upload-avatar"
            className="bg-teal-50 text-teal-700 rounded-xl px-3 py-2 text-[12px] font-semibold w-fit"
          >
            {t("workflow.edit.uploadAvatar")}
          </button>
          <button
            data-testid="edit-profile-save"
            className="bg-teal-600 text-white rounded-xl px-3 py-2 text-[12px] font-semibold w-fit"
          >
            {t("workflow.edit.save")}
          </button>
        </Card>
      </div>
    </div>
  );
}

export function DocumentsScreen() {
  const { t } = useApp();

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("workflow.documents.title")} back />
      <div className="px-4 py-4">
        <Card className="flex flex-col gap-3">
          <p className="font-bold text-gray-900 text-[14px]">{t("workflow.documents.title")}</p>
          <button
            data-testid="documents-upload"
            className="bg-teal-600 text-white rounded-xl px-3 py-2 text-[12px] font-semibold w-fit"
          >
            {t("workflow.documents.upload")}
          </button>
          <p data-testid="documents-url-demo" className="text-gray-500 text-[12px]">
            https://demo.local/document/mock-url
          </p>
        </Card>
      </div>
    </div>
  );
}

export function NotificationsScreen() {
  const { t } = useApp();

  return (
    <Placeholder
      title={t("workflow.notifications.title")}
      subtitle={t("workflow.notifications.subtitle")}
    />
  );
}

export function PaymentMethodsScreen() {
  const { t } = useApp();

  return (
    <Placeholder
      title={t("workflow.payments.title")}
      subtitle={t("workflow.payments.subtitle")}
    />
  );
}

export function SettingsScreen() {
  const { t } = useApp();

  return (
    <Placeholder
      title={t("workflow.settings.title")}
      subtitle={t("workflow.settings.subtitle")}
    />
  );
}

export function HistoryScreen() {
  const { projects } = useProjects();
  const { t, locale } = useApp();
  const completed = projects.filter((project) =>
    ["completed", "disputed", "complete_requested"].includes(project.status)
  );

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("workflow.history.title")} back />
      <div className="px-4 py-4 flex flex-col gap-3">
        <p className="font-bold text-gray-800 text-[13px]">{t("workflow.history.transactions")}</p>
        {completed.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-[12px]">{t("workflow.history.empty")}</p>
          </Card>
        ) : (
          completed.map((project) => (
            <Card key={project.id}>
              <p className="font-semibold text-gray-800 text-[13px]">{project.title}</p>
              <p className="text-gray-500 text-[11px] capitalize">{t(`status.${project.status}`)}</p>
              {project.escrowAmount ? (
                <p className="text-teal-700 text-[12px] font-semibold mt-1">
                  {formatCurrency(project.escrowAmount, locale)}
                </p>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export function RecommendationsScreen() {
  const { t, lang } = useApp();
  const contractors = getContractors(lang).slice(0, 4);
  const navigate = useNavigate();

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("workflow.recommendations.title")} back />
      <div className="px-4 py-4 flex flex-col gap-3">
        {contractors.map((contractor, index) => (
          <button
            key={contractor.id}
            onClick={() => navigate(`/contractor/${contractor.id}`)}
            className="bg-white rounded-2xl px-4 py-3 text-left pressable"
            data-testid={`recommendation-item-${index}`}
          >
            <p className="font-semibold text-gray-800 text-[13px]">
              {contractor.businessName}
            </p>
            <p className="text-gray-500 text-[11px]">{contractor.specialty.join(", ")}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AgreementReviewScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const { t, locale } = useApp();
  const project = getProject(id ?? "");
  const selected = project?.quotes.find((quote) => quote.id === project.acceptedQuoteId);

  if (!project) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <TopBar title={t("workflow.agreement.title")} back />
        <div className="p-4">
          <Card>
            <p className="text-gray-500 text-[12px]">{t("detail.projectNotFound")}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("workflow.agreement.snapshotTitle")} back />
      <div className="px-4 py-4 flex flex-col gap-3">
        <Card data-testid="agreement-review-card">
          <p className="font-bold text-gray-800 text-[14px]">{project.title}</p>
          <p data-testid="agreement-review-contractor" className="text-gray-500 text-[12px] mt-1">
            {t("workflow.agreement.contractor")} {selected?.contractorId ?? t("status.pending")}
          </p>
          <p data-testid="agreement-review-price" className="text-gray-500 text-[12px]">
            {t("workflow.agreement.price")} {selected ? formatCurrency(selected.amount, locale) : t("workflow.agreement.tbd")}
          </p>
          <p data-testid="agreement-review-timeline" className="text-gray-500 text-[12px]">
            {t("workflow.agreement.timeline")} {selected?.timeline ?? project.timeline}
          </p>
          <p data-testid="agreement-review-scope" className="text-gray-500 text-[12px]">
            {t("workflow.agreement.scope")} {selected?.notes ?? project.description}
          </p>
          <p data-testid="agreement-review-policy" className="text-gray-500 text-[12px]">
            {t("workflow.agreement.policy")}
          </p>
          <p data-testid="agreement-review-fee" className="text-gray-500 text-[12px]">
            {t("workflow.agreement.platformFee")}
          </p>
          <button
            data-testid="agreement-review-accept"
            className="mt-3 bg-teal-600 text-white rounded-xl px-4 py-2 text-[12px] font-semibold"
            onClick={() => navigate(`/project/${project.id}/fund`)}
          >
            {t("workflow.agreement.accept")}
          </button>
        </Card>
      </div>
    </div>
  );
}

export function IssueScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { raiseIssue } = useProjects();
  const { t } = useApp();

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("btn.raiseIssue")} back />
      <div className="px-4 py-4">
        <Card className="flex flex-col gap-3">
          <p className="font-bold text-gray-800 text-[14px]">
            {t("workflow.issue.holdNotice")}
          </p>
          <button
            className="bg-red-600 text-white rounded-xl px-4 py-2 text-[12px] font-semibold w-fit"
            onClick={async () => {
              if (id) {
                await raiseIssue(id);
              }
              navigate(`/project/${id}`);
            }}
          >
            {t("workflow.issue.confirm")}
          </button>
        </Card>
      </div>
    </div>
  );
}

export function AvailabilityScreen() {
  const { t } = useApp();

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("workflow.availability.title")} back />
      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {[History, Bell, Wallet, FileText, Settings].map((Icon, index) => (
          <Card key={index} className="flex flex-col items-center justify-center py-6 gap-2">
            <Icon className="text-teal-600" size={20} />
            <p className="text-[11px] text-gray-600 font-semibold">
              {t("workflow.availability.slot")} {index + 1}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
