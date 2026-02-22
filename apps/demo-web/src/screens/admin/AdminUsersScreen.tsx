import { AdminCollectionScreen } from "./AdminCollectionScreen";
import { useApp } from "../../context/AppContext";

export default function AdminUsersScreen() {
  const { t } = useApp();

  return (
    <AdminCollectionScreen
      title={t("admin.nav.users")}
      collectionPath="users"
      testIdPrefix="users"
      columns={[
        { key: "id", label: t("admin.columns.id") },
        { key: "name", label: t("admin.columns.name") },
        { key: "role", label: t("admin.columns.role") },
        { key: "email", label: t("admin.columns.email") },
      ]}
    />
  );
}
