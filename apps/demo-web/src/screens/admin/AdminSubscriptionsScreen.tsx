import { AdminCollectionScreen } from "./AdminCollectionScreen";
import { useApp } from "../../context/AppContext";

export default function AdminSubscriptionsScreen() {
  const { t } = useApp();

  return (
    <AdminCollectionScreen
      title={t("admin.nav.subscriptions")}
      collectionPath="subscriptions"
      testIdPrefix="subscriptions"
      columns={[
        { key: "id", label: t("admin.columns.id") },
        { key: "planId", label: t("admin.columns.plan") },
        { key: "status", label: t("admin.columns.status") },
        { key: "customerId", label: t("admin.columns.customer") },
      ]}
    />
  );
}
