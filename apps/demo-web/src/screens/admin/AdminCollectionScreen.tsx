import TopBar from "../../components/layout/TopBar";
import Card from "../../components/ui/Card";
import { useCollectionData } from "../../hooks/useCollectionData";

type Props = {
  title: string;
  collectionPath: string;
  columns: Array<{ key: string; label: string }>;
  testIdPrefix: string;
};

export function AdminCollectionScreen({
  title,
  collectionPath,
  columns,
  testIdPrefix,
}: Props) {
  const { rows, loading, error } = useCollectionData(collectionPath, 80);

  return (
    <div className="h-full scroll-area bg-gray-50">
      <TopBar title={title} back />
      <div className="px-4 py-4 flex flex-col gap-3">
        <Card>
          <p className="text-[12px] text-gray-500">
            {loading ? "Loading..." : `${rows.length} rows`}
          </p>
          {error ? <p className="text-[12px] text-red-600 mt-2">{error}</p> : null}
        </Card>
        <Card padding="none">
          <table className="w-full text-left" data-testid={`${testIdPrefix}-table`}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="text-[11px] text-gray-400 uppercase px-3 py-2 border-b border-gray-100"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody data-testid={`${testIdPrefix}-rows`}>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td
                      key={`${row.id}-${column.key}`}
                      className="text-[12px] text-gray-700 px-3 py-2 border-b border-gray-50"
                    >
                      {String(row[column.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
