import { AdminCollectionScreen } from "./AdminCollectionScreen";
import { useApp } from "../../context/AppContext";

export default function AdminDepositsScreen() {
  const { t } = useApp();

  return (
    <AdminCollectionScreen
      title={t("admin.nav.deposits")}
      collectionPath="estimateDeposits"
      testIdPrefix="deposits"
      columns={[
        { key: "id", label: t("admin.columns.id") },
        { key: "projectId", label: t("admin.columns.project") },
        { key: "status", label: t("admin.columns.status") },
        { key: "amountCents", label: t("admin.columns.amountCents") },
      ]}
    />
  );
}
