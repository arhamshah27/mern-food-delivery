import React from "react";
import { TableRowSkeleton } from "../common/Skeleton";
import EmptyState from "../common/EmptyState";

const DataTable = ({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found",
  emptyDescription = "There are no entries available for the selected filters.",
  className = "",
}) => {
  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-[#C6A15B]/20 bg-white dark:bg-[#14151A] shadow-xl ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#232530] bg-slate-50 dark:bg-[#08090D] text-[11px] font-bold uppercase tracking-wider text-[#C6A15B]">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`py-3.5 px-4 sm:px-6 ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#232530] text-sm text-slate-800 dark:text-[#F5F0E6]">
            {loading ? (
              <>
                <TableRowSkeleton cols={columns.length} />
                <TableRowSkeleton cols={columns.length} />
                <TableRowSkeleton cols={columns.length} />
                <TableRowSkeleton cols={columns.length} />
              </>
            ) : data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row._id || rowIndex}
                  className="hover:bg-slate-50 dark:hover:bg-[#1A1B23] transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`py-3.5 px-4 sm:px-6 align-middle ${
                        col.cellClassName || ""
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8">
                  <EmptyState
                    title={emptyMessage}
                    description={emptyDescription}
                    className="border-0 bg-transparent my-0"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
