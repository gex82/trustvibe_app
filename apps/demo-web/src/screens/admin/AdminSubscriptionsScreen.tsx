import { AdminCollectionScreen } from "./AdminCollectionScreen";

export default function AdminSubscriptionsScreen() {
  return (
    <AdminCollectionScreen
      title="Subscriptions"
      collectionPath="subscriptions"
      testIdPrefix="subscriptions"
      columns={[
        { key: "id", label: "ID" },
        { key: "planId", label: "Plan" },
        { key: "status", label: "Status" },
        { key: "customerId", label: "Customer" },
      ]}
    />
  );
}
