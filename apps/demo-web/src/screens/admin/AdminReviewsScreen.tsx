import { AdminCollectionScreen } from "./AdminCollectionScreen";

export default function AdminReviewsScreen() {
  return (
    <AdminCollectionScreen
      title="Reviews"
      collectionPath="reviews"
      testIdPrefix="reviews"
      columns={[
        { key: "id", label: "Review ID" },
        { key: "projectId", label: "Project" },
        { key: "rating", label: "Rating" },
        { key: "moderationStatus", label: "Moderation" },
      ]}
    />
  );
}
