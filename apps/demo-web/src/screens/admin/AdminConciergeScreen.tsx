import { AdminCollectionScreen } from "./AdminCollectionScreen";

export default function AdminConciergeScreen() {
  return (
    <AdminCollectionScreen
      title="Concierge"
      collectionPath="highTicketCases"
      testIdPrefix="concierge"
      columns={[
        { key: "id", label: "Case ID" },
        { key: "projectId", label: "Project" },
        { key: "status", label: "Status" },
        { key: "conciergeManagerId", label: "Manager" },
      ]}
    />
  );
}
