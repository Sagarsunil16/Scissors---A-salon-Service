import { TableProps } from "../interfaces/interface";

const Table = ({ columns, data, actions }: TableProps) => {
  console.log(columns,data,actions,"cols","data","action")
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.accessor} className="border p-2 bg-gray-100 text-left">
                {col.header}
              </th>
            ))}
            {actions && <th className="border p-2 bg-gray-100 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row._id || index} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.accessor} className="border p-2 align-middle">
                  {typeof row[col.accessor] === "boolean" ? (
                    row[col.accessor] ? (
                      "Active"
                    ) : (
                      "Blocked"
                    )
                  ) : typeof row[col.accessor] === "object" && row[col.accessor] !== null ? (
                    // Render nested object
                    <div>
                      {Object.entries(row[col.accessor]).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    row[col.accessor]
                  )}
                </td>
              ))}
              {actions && (
                <td className="border p-2 align-middle">
                  <div className="flex justify-center items-center space-x-2">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => action.onClick(row)}
                        className={`px-3 py-1 text-sm rounded ${action.className}`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
