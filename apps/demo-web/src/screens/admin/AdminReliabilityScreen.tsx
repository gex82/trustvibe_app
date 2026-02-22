import { AdminCollectionScreen } from "./AdminCollectionScreen";
import { useApp } from "../../context/AppContext";

export default function AdminReliabilityScreen() {
  const { t } = useApp();

  return (
    <AdminCollectionScreen
      title={t("admin.nav.reliability")}
      collectionPath="reliabilityScores"
      testIdPrefix="reliability"
      columns={[
        { key: "id", label: t("admin.columns.contractor") },
        { key: "score", label: t("admin.columns.score") },
        { key: "eligible", label: t("admin.columns.eligible") },
        { key: "updatedAt", label: t("admin.columns.updated") },
      ]}
    />
  );
}
