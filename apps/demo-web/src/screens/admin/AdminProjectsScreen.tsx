import { AdminCollectionScreen } from "./AdminCollectionScreen";

export default function AdminProjectsScreen() {
  return (
    <AdminCollectionScreen
      title="Projects"
      collectionPath="projects"
      testIdPrefix="projects"
      columns={[
        { key: "id", label: "Project ID" },
        { key: "title", label: "Title" },
        { key: "customerId", label: "Customer" },
        { key: "contractorId", label: "Contractor" },
        { key: "escrowState", label: "Escrow State" },
      ]}
    />
  );
}
