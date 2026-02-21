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
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <TopBar title="Profile" />
        <div className="flex-1 p-4">
          <EmptyState
            icon={FileText}
            title="No session"
            subtitle="Sign in to access profile"
          />
        </div>
      </div>
    );
  }

  const actions = [
    {
      id: "profile-edit",
      label: "Edit Profile",
      path: "/profile/edit",
    },
    {
      id: "profile-documents",
      label: "Documents",
      path: "/profile/documents",
    },
    {
      id: "profile-history",
      label: "History",
      path: "/history",
    },
    {
      id: "profile-messages",
      label: "Messages",
      path: "/messages",
    },
    {
      id: "profile-recommendations",
      label: "Recommendations",
      path: "/recommendations",
    },
    {
      id: "profile-notifications",
      label: "Notifications",
      path: "/notifications",
    },
    {
      id: "profile-payment-methods",
      label: "Payment Methods",
      path: "/payment-methods",
    },
    {
      id: "profile-settings",
      label: "Settings",
      path: "/settings",
    },
  ];

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title="Profile" />
      <div className="px-4 py-4 flex flex-col gap-3">
        <Card>
          <p className="font-extrabold text-gray-900 text-[16px]">{currentUser.name}</p>
          <p className="text-gray-500 text-[12px]">{currentUser.email}</p>
          <p className="text-gray-500 text-[12px] capitalize mt-1">{currentUser.role}</p>
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
            Earnings
          </button>
        )}
        <button
          data-testid="profile-logout"
          onClick={() => void logout()}
          className="w-full text-left bg-red-50 rounded-2xl px-4 py-3 font-semibold text-red-600 pressable"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export function EditProfileScreen() {
  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title="Edit Profile" back />
      <div className="px-4 py-4">
        <Card className="flex flex-col gap-3">
          <p className="font-bold text-gray-900 text-[14px]">Profile Editor</p>
          <p className="text-gray-500 text-[12px]">
            Use this surface to validate profile update UX in demo mode.
          </p>
          <button
            data-testid="edit-profile-upload-avatar"
            className="bg-teal-50 text-teal-700 rounded-xl px-3 py-2 text-[12px] font-semibold w-fit"
          >
            Upload Avatar
          </button>
          <button
            data-testid="edit-profile-save"
            className="bg-teal-600 text-white rounded-xl px-3 py-2 text-[12px] font-semibold w-fit"
          >
            Save
          </button>
        </Card>
      </div>
    </div>
  );
}

export function DocumentsScreen() {
  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title="Documents" back />
      <div className="px-4 py-4">
        <Card className="flex flex-col gap-3">
          <p className="font-bold text-gray-900 text-[14px]">Documents</p>
          <button
            data-testid="documents-upload"
            className="bg-teal-600 text-white rounded-xl px-3 py-2 text-[12px] font-semibold w-fit"
          >
            Upload Document
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
  return (
    <Placeholder
      title="Notifications"
      subtitle="Notification center for lifecycle and trust events."
    />
  );
}

export function PaymentMethodsScreen() {
  return (
    <Placeholder
      title="Payment Methods"
      subtitle="Card and payout method management surface."
    />
  );
}

export function SettingsScreen() {
  return (
    <Placeholder title="Settings" subtitle="Language, privacy, and account controls." />
  );
}

export function HistoryScreen() {
  const { projects } = useProjects();
  const completed = projects.filter((project) =>
    ["completed", "disputed", "complete_requested"].includes(project.status)
  );

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title="History" back />
      <div className="px-4 py-4 flex flex-col gap-3">
        <p className="font-bold text-gray-800 text-[13px]">Transactions</p>
        {completed.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-[12px]">No historical items yet.</p>
          </Card>
        ) : (
          completed.map((project) => (
            <Card key={project.id}>
              <p className="font-semibold text-gray-800 text-[13px]">{project.title}</p>
              <p className="text-gray-500 text-[11px] capitalize">{project.status}</p>
              {project.escrowAmount ? (
                <p className="text-teal-700 text-[12px] font-semibold mt-1">
                  {formatCurrency(project.escrowAmount)}
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
  const contractors = getContractors().slice(0, 4);
  const navigate = useNavigate();

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title="Recommendations" back />
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
  const project = getProject(id ?? "");
  const selected = project?.quotes.find((quote) => quote.id === project.acceptedQuoteId);

  if (!project) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <TopBar title="Agreement" back />
        <div className="p-4">
          <Card>
            <p className="text-gray-500 text-[12px]">Project not found.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title="Agreement Snapshot" back />
      <div className="px-4 py-4 flex flex-col gap-3">
        <Card data-testid="agreement-review-card">
          <p className="font-bold text-gray-800 text-[14px]">{project.title}</p>
          <p data-testid="agreement-review-contractor" className="text-gray-500 text-[12px] mt-1">
            Contractor: {selected?.contractorId ?? "Pending"}
          </p>
          <p data-testid="agreement-review-price" className="text-gray-500 text-[12px]">
            Price: {selected ? formatCurrency(selected.amount) : "TBD"}
          </p>
          <p data-testid="agreement-review-timeline" className="text-gray-500 text-[12px]">
            Timeline: {selected?.timeline ?? project.timeline}
          </p>
          <p data-testid="agreement-review-scope" className="text-gray-500 text-[12px]">
            Scope: {selected?.notes ?? project.description}
          </p>
          <p data-testid="agreement-review-policy" className="text-gray-500 text-[12px]">
            Policy: Payment is released only after customer approval.
          </p>
          <p data-testid="agreement-review-fee" className="text-gray-500 text-[12px]">
            Platform fee: 7%
          </p>
          <button
            data-testid="agreement-review-accept"
            className="mt-3 bg-teal-600 text-white rounded-xl px-4 py-2 text-[12px] font-semibold"
            onClick={() => navigate(`/project/${project.id}/fund`)}
          >
            Accept agreement
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
            Funds will remain on hold while this issue is under review.
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
            Confirm issue
          </button>
        </Card>
      </div>
    </div>
  );
}

export function AvailabilityScreen() {
  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title="Availability" back />
      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {[History, Bell, Wallet, FileText, Settings].map((Icon, index) => (
          <Card key={index} className="flex flex-col items-center justify-center py-6 gap-2">
            <Icon className="text-teal-600" size={20} />
            <p className="text-[11px] text-gray-600 font-semibold">Slot {index + 1}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
