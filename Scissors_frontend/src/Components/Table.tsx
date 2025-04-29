import { TableProps } from "../interfaces/interface";

const Table = ({ columns, data, actions }: TableProps) => {
  console.log(columns, data, actions, "cols", "data", "action");
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 min-w-[100px]"
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 min-w-[150px]">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={row._id || index} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={col.accessor}
                  className="px-2 py-2 sm:px-4 sm:py-3 text-xs text-gray-900 align-middle whitespace-nowrap"
                >
                  {typeof row[col.accessor] === "boolean" ? (
                    row[col.accessor] ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Blocked</span>
                    )
                  ) : typeof row[col.accessor] === "object" && row[col.accessor] !== null ? (
                    <div className="space-y-1">
                      {Object.entries(row[col.accessor]).map(([key, value]) => (
                        <div key={key} className="text-xs">
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
                <td className="px-2 py-2 sm:px-4 sm:py-3 align-middle">
                  <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => action.onClick(row)}
                        disabled={action.disabled ? action.disabled(row) : false}
                        className={`w-full sm:w-auto px-2 py-1 text-xs rounded font-medium text-white ${
                          action.className
                        } ${action.disabled && action.disabled(row) ? "opacity-50 cursor-not-allowed" : ""} transition-colors`}
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