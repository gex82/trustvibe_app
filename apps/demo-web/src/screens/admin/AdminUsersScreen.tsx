import { AdminCollectionScreen } from "./AdminCollectionScreen";

export default function AdminUsersScreen() {
  return (
    <AdminCollectionScreen
      title="Users"
      collectionPath="users"
      testIdPrefix="users"
      columns={[
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "email", label: "Email" },
      ]}
    />
  );
}
