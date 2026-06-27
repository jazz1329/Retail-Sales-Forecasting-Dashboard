import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

export interface ColumnHeader {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  columns: ColumnHeader[];
  data: any[];
  loading?: boolean;
  page: number;
  limit: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  searchPlaceholder?: string;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  actionsHeader?: string;
  renderActions?: (row: any) => React.ReactNode;
  renderCell?: (row: any, columnKey: string) => React.ReactNode;
  filterComponent?: React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  page,
  limit,
  totalCount,
  onPageChange,
  onSortChange,
  sortKey,
  sortDir,
  searchPlaceholder = 'Search records...',
  onSearchChange,
  searchValue = '',
  actionsHeader = 'Actions',
  renderActions,
  renderCell,
  filterComponent,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalCount);

  const handleSort = (key: string) => {
    if (!onSortChange) return;
    const isAsc = sortKey === key && sortDir === 'asc';
    onSortChange(key, isAsc ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      {(onSearchChange || filterComponent) && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {onSearchChange ? (
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-xl text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder-slate-400"
              />
            </div>
          ) : (
            <div></div>
          )}
          {filterComponent && <div className="flex w-full sm:w-auto items-center gap-2">{filterComponent}</div>}
        </div>
      )}

      {/* Main Table Grid */}
      <div className="w-full overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-dark-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-xs">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-6 py-3.5 font-semibold ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${col.sortable && onSortChange ? 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors' : ''}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className={`flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                      <span>{col.label}</span>
                      {col.sortable && onSortChange && (
                        <span>
                          {sortKey !== col.key && <ArrowUpDown size={12} className="opacity-40" />}
                          {sortKey === col.key && sortDir === 'asc' && <ArrowUp size={12} className="text-brand-500" />}
                          {sortKey === col.key && sortDir === 'desc' && <ArrowDown size={12} className="text-brand-500" />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {renderActions && <th scope="col" className="px-6 py-3.5 text-right font-semibold">{actionsHeader}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                // Skeletons
                Array.from({ length: limit }).map((_, rIdx) => (
                  <tr key={rIdx} className="bg-white dark:bg-dark-900 animate-pulse">
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    ))}
                    {renderActions && (
                      <td className="px-6 py-4 text-right">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12 ml-auto"></div>
                      </td>
                    )}
                  </tr>
                ))
              ) : data.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={columns.length + (renderActions ? 1 : 0)} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                // Data Rows
                data.map((row, rIdx) => (
                  <tr
                    key={row.id || rIdx}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 bg-white dark:bg-dark-900 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-6 py-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-200 ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {renderCell ? renderCell(row, col.key) : row[col.key]}
                      </td>
                    ))}
                    {renderActions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">{renderActions(row)}</div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/20 text-xs font-semibold text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{totalCount === 0 ? 0 : startRecord}</span> to{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{endRecord}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{totalCount}</span> entries
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="p-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-dark-900 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-lg text-slate-700 dark:text-slate-200 select-none">
              {page} / {totalPages}
            </div>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="p-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-dark-900 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
