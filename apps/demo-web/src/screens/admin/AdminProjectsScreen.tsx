import { AdminCollectionScreen } from "./AdminCollectionScreen";
import { useApp } from "../../context/AppContext";

export default function AdminProjectsScreen() {
  const { t } = useApp();

  return (
    <AdminCollectionScreen
      title={t("admin.projects.title")}
      collectionPath="projects"
      testIdPrefix="projects"
      columns={[
        { key: "id", label: t("admin.columns.projectId") },
        { key: "title", label: t("admin.columns.title") },
        { key: "customerId", label: t("admin.columns.customer") },
        { key: "contractorId", label: t("admin.columns.contractor") },
        { key: "escrowState", label: t("admin.columns.escrowState") },
      ]}
    />
  );
}
