import {
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Languages,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../../components/layout/TopBar";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { findUserById, getContractors } from "../../data/users";
import { formatCurrency } from "../../utils/formatters";
import { formatContractorDisplay } from "../../utils/contractorDisplay";

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
  if (currentUser.role === "contractor") {
    actions.splice(2, 0, {
      id: "profile-availability",
      label: t("workflow.profile.availability"),
      path: "/availability",
    });
  }

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
  const notifications = [
    {
      id: "escrow-funded",
      title: t("workflow.notifications.itemEscrowFundedTitle"),
      description: t("workflow.notifications.itemEscrowFundedDescription"),
      time: t("workflow.notifications.itemEscrowFundedTime"),
      read: false,
    },
    {
      id: "quote-submitted",
      title: t("workflow.notifications.itemQuoteTitle"),
      description: t("workflow.notifications.itemQuoteDescription"),
      time: t("workflow.notifications.itemQuoteTime"),
      read: true,
    },
    {
      id: "review-reminder",
      title: t("workflow.notifications.itemReviewTitle"),
      description: t("workflow.notifications.itemReviewDescription"),
      time: t("workflow.notifications.itemReviewTime"),
      read: true,
    },
  ];

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("workflow.notifications.title")} back />
      <div className="px-4 py-4 flex flex-col gap-3">
        <p className="font-bold text-gray-800 text-[13px]">
          {t("workflow.notifications.sectionToday")}
        </p>
        {notifications.map((item) => (
          <Card key={item.id} data-testid={`notification-item-${item.id}`} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-800 text-[13px]">{item.title}</p>
                <p className="text-gray-500 text-[12px] mt-0.5">{item.description}</p>
              </div>
              <span
                className={`text-[10px] px-2 py-1 rounded-full font-semibold ${item.read ? "bg-gray-100 text-gray-600" : "bg-teal-50 text-teal-700"}`}
              >
                {item.read
                  ? t("workflow.notifications.read")
                  : t("workflow.notifications.unread")}
              </span>
            </div>
            <p className="text-gray-400 text-[11px]">{item.time}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function PaymentMethodsScreen() {
  const { t } = useApp();

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("workflow.payments.title")} back />
      <div className="px-4 py-4 flex flex-col gap-3">
        <Card data-testid="payment-method-card" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900 text-[14px]">{t("workflow.payments.primaryTitle")}</p>
            <CreditCard size={16} className="text-teal-600" />
          </div>
          <p className="text-gray-700 text-[12px]">{t("workflow.payments.primaryMasked")}</p>
          <p className="text-gray-500 text-[11px]">{t("workflow.payments.primaryBilling")}</p>
          <span className="text-[10px] font-semibold w-fit bg-teal-50 text-teal-700 rounded-full px-2 py-1">
            {t("workflow.payments.default")}
          </span>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 text-[13px]">{t("workflow.payments.addMethodTitle")}</p>
            <p className="text-gray-500 text-[11px]">{t("workflow.payments.addMethodSubtitle")}</p>
          </div>
          <button
            data-testid="payment-method-add-preview"
            className="bg-teal-600 text-white rounded-xl px-3 py-2 text-[11px] font-semibold pressable"
          >
            {t("workflow.payments.addMethodCta")}
          </button>
        </Card>
      </div>
    </div>
  );
}

export function SettingsScreen() {
  const { t } = useApp();

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("workflow.settings.title")} back />
      <div className="px-4 py-4 flex flex-col gap-3">
        <Card data-testid="settings-language-card" className="flex items-start gap-3">
          <Languages size={16} className="text-teal-600 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800 text-[13px]">{t("workflow.settings.languageTitle")}</p>
            <p className="text-gray-500 text-[11px]">{t("workflow.settings.languageSubtitle")}</p>
          </div>
        </Card>
        <Card className="flex items-start gap-3">
          <Lock size={16} className="text-teal-600 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800 text-[13px]">{t("workflow.settings.privacyTitle")}</p>
            <p className="text-gray-500 text-[11px]">{t("workflow.settings.privacySubtitle")}</p>
          </div>
        </Card>
        <Card className="flex items-start gap-3">
          <ShieldCheck size={16} className="text-teal-600 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-800 text-[13px]">{t("workflow.settings.supportTitle")}</p>
            <p className="text-gray-500 text-[11px]">{t("workflow.settings.supportSubtitle")}</p>
          </div>
        </Card>
      </div>
    </div>
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
  const { t, locale, lang } = useApp();
  const project = getProject(id ?? "");
  const selected = project?.quotes.find((quote) => quote.id === project.acceptedQuoteId);
  const linkedContractorId = selected?.contractorId ?? project?.contractorId;
  const linkedContractor = linkedContractorId ? findUserById(linkedContractorId, lang) : null;
  const contractorDisplay = formatContractorDisplay(linkedContractor, t("status.pending"));

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
            {t("workflow.agreement.contractor")} {contractorDisplay}
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
  const [slots, setSlots] = useState<
    Array<{ id: "mon" | "tue" | "wed" | "thu" | "fri"; enabled: boolean; window: 0 | 1 | 2 }>
  >([
    { id: "mon", enabled: true, window: 0 },
    { id: "tue", enabled: true, window: 1 },
    { id: "wed", enabled: false, window: 0 },
    { id: "thu", enabled: true, window: 2 },
    { id: "fri", enabled: true, window: 1 },
  ]);
  const [saved, setSaved] = useState(false);

  const windowLabels = [
    t("workflow.availability.windowMorning"),
    t("workflow.availability.windowMidday"),
    t("workflow.availability.windowAfternoon"),
  ];

  const toggleSlot = (id: "mon" | "tue" | "wed" | "thu" | "fri") => {
    setSaved(false);
    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, enabled: !slot.enabled } : slot))
    );
  };

  const cycleWindow = (id: "mon" | "tue" | "wed" | "thu" | "fri") => {
    setSaved(false);
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, window: ((slot.window + 1) % 3) as 0 | 1 | 2 } : slot
      )
    );
  };

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={t("workflow.availability.title")} back />
      <div className="px-4 py-4 flex flex-col gap-3">
        {slots.map((slot) => (
          <Card key={slot.id} data-testid={`availability-day-${slot.id}`} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800 text-[13px]">
                {t(`workflow.availability.day.${slot.id}`)}
              </p>
              <button
                data-testid={`availability-toggle-${slot.id}`}
                onClick={() => toggleSlot(slot.id)}
                className={`rounded-full px-2 py-1 text-[10px] font-semibold pressable ${slot.enabled ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-gray-600"}`}
              >
                {slot.enabled
                  ? t("workflow.availability.available")
                  : t("workflow.availability.unavailable")}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                <Clock3 size={12} />
                <span>{slot.enabled ? windowLabels[slot.window] : t("workflow.availability.notSet")}</span>
              </div>
              <button
                data-testid={`availability-window-${slot.id}`}
                onClick={() => cycleWindow(slot.id)}
                disabled={!slot.enabled}
                className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-[10px] font-semibold text-gray-700 disabled:opacity-50 pressable"
              >
                {t("workflow.availability.changeWindow")}
              </button>
            </div>
          </Card>
        ))}
        <button
          data-testid="availability-save"
          onClick={() => setSaved(true)}
          className="bg-teal-600 text-white rounded-xl px-4 py-2 text-[12px] font-semibold w-fit pressable"
        >
          {t("workflow.availability.save")}
        </button>
        {saved ? (
          <Card data-testid="availability-save-banner" className="bg-teal-50 border border-teal-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-teal-700" />
              <p className="text-teal-700 text-[12px] font-semibold">
                {t("workflow.availability.saved")}
              </p>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
