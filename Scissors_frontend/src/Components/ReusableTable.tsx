import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  minWidth?: string;
  render?: (
    item: T,
    isEditing: boolean,
    editForm: any,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
    handleCustomChange?: any
  ) => React.ReactNode;
}

export interface Action<T> {
  label: string;
  onClick: (item: T) => void;
  className: string;
  render?: (item: T) => React.ReactNode;
  disabled?: (item: T) => boolean;
}

export interface ReusableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  loading: boolean;
  searchQuery: string;
  editingId: string | null;
  editForm: any;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPageChange: (page: number) => void;
  onEditClick?: (item: T) => void;
  onEditSave?: (id: string) => void;
  onEditCancel?: () => void;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  actions?: Action<T>[];
  getRowId: (item: T) => string;
}

const ReusableTable = <T,>({
  columns,
  data,
  totalItems,
  itemsPerPage,
  currentPage,
  loading,
  searchQuery,
  editingId,
  editForm,
  onSearchChange,
  onPageChange,
  onEditClick,
  onEditSave,
  onEditCancel,
  onInputChange,
  actions = [],
  getRowId,
}: ReusableTableProps<T>) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

  // Debug pagination state
  console.log('ReusableTable Pagination:', {
    currentPage,
    totalItems,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
  });

  const handlePageChange = (page: number) => {
    console.log('Page change requested:', page);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full sm:w-64 text-sm"
        />
      </div>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-4">No data found</div>
      ) : (
        <>
          <div className="text-xs sm:text-sm text-gray-600 mb-2">
            Showing {startIndex}-{endIndex} of {totalItems} items
          </div>
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider"
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.header}
                    </th>
                  ))}
                  {(actions.length > 0 || onEditClick || onEditSave) && (
                    <th className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider min-w-[120px]">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-900 align-middle"
                      >
                        {column.render
                          ? column.render(item, editingId === getRowId(item), editForm, onInputChange || (() => {}))
                          : (item[column.accessor as keyof T] as unknown as string)}
                      </td>
                    ))}
                    {(actions.length > 0 || onEditClick || onEditSave) && (
                      <td className="border border-gray-200 px-2 py-2 sm:px-4 sm:py-3 align-middle">
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          {editingId === getRowId(item) && onEditSave && onEditCancel ? (
                            <>
                              <button
                                onClick={() => onEditSave(getRowId(item))}
                                className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-white bg-green-500 hover:bg-green-600 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={onEditCancel}
                                className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-white bg-gray-500 hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              {onEditClick && (
                                <button
                                  className="w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
                                  onClick={() => onEditClick(item)}
                                >
                                  Edit
                                </button>
                              )}
                              {actions.map((action, actionIndex) => (
                                <React.Fragment key={actionIndex}>
                                  {action.render ? (
                                    action.render(item)
                                  ) : (
                                    <button
                                      onClick={() => action.onClick(item)}
                                      className={action.className}
                                      disabled={action.disabled ? action.disabled(item) : false}
                                    >
                                      {action.label}
                                    </button>
                                  )}
                                </React.Fragment>
                              ))}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-2 py-1 text-xs sm:text-sm"
            >
              Previous
            </Button>
            <span className="px-2 py-1 text-xs sm:text-sm font-medium text-white bg-black rounded-md flex items-center h-8">
              {currentPage}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-2 py-1 text-xs sm:text-sm"
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReusableTable;