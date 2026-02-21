import { AdminCollectionScreen } from "./AdminCollectionScreen";

export default function AdminReliabilityScreen() {
  return (
    <AdminCollectionScreen
      title="Reliability"
      collectionPath="reliabilityScores"
      testIdPrefix="reliability"
      columns={[
        { key: "id", label: "Contractor" },
        { key: "score", label: "Score" },
        { key: "eligible", label: "Eligible" },
        { key: "updatedAt", label: "Updated" },
      ]}
    />
  );
}
