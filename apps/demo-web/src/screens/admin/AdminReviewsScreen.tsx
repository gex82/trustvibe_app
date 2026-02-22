import { AdminCollectionScreen } from "./AdminCollectionScreen";
import { useApp } from "../../context/AppContext";

export default function AdminReviewsScreen() {
  const { t } = useApp();

  return (
    <AdminCollectionScreen
      title={t("label.reviews")}
      collectionPath="reviews"
      testIdPrefix="reviews"
      columns={[
        { key: "id", label: t("admin.columns.reviewId") },
        { key: "projectId", label: t("admin.columns.project") },
        { key: "rating", label: t("label.rating") },
        { key: "moderationStatus", label: t("admin.columns.moderation") },
      ]}
    />
  );
}
