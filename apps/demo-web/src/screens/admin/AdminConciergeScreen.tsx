import { AdminCollectionScreen } from "./AdminCollectionScreen";
import { useApp } from "../../context/AppContext";

export default function AdminConciergeScreen() {
  const { t } = useApp();

  return (
    <AdminCollectionScreen
      title={t("admin.nav.concierge")}
      collectionPath="highTicketCases"
      testIdPrefix="concierge"
      columns={[
        { key: "id", label: t("admin.columns.caseId") },
        { key: "projectId", label: t("admin.columns.project") },
        { key: "status", label: t("admin.columns.status") },
        { key: "conciergeManagerId", label: t("admin.columns.manager") },
      ]}
    />
  );
}
