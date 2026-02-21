import { AdminCollectionScreen } from "./AdminCollectionScreen";

export default function AdminDepositsScreen() {
  return (
    <AdminCollectionScreen
      title="Deposits"
      collectionPath="estimateDeposits"
      testIdPrefix="deposits"
      columns={[
        { key: "id", label: "ID" },
        { key: "projectId", label: "Project" },
        { key: "status", label: "Status" },
        { key: "amountCents", label: "Amount (cents)" },
      ]}
    />
  );
}
