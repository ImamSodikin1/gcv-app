import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import { FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface ModernTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isDark: boolean;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: TData) => void;
}

export function ModernTable<TData>({
  columns,
  data,
  isDark,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onRowClick,
}: ModernTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textSub = isDark ? 'text-gray-400' : 'text-gray-600';
  const headerBg = isDark ? 'bg-[#181926]/50' : 'bg-gray-100';
  const headerText = isDark ? 'text-gray-300' : 'text-gray-700';
  const rowHover = isDark ? 'hover:bg-white/5 transition-colors duration-200' : 'hover:bg-gray-50 transition-colors duration-200';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`rounded-lg overflow-hidden shadow-2xl ${isDark ? 'bg-[#181926]/50 border-2 border-purple-500/30' : 'bg-white border-2 border-blue-200'}`}>
      <style>{`
        .modern-table-scroll::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .modern-table-scroll::-webkit-scrollbar-track {
          background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
          border-radius: 10px;
        }
        .modern-table-scroll::-webkit-scrollbar-thumb {
          background: ${isDark ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'};
          border-radius: 10px;
          cursor: pointer;
        }
        .modern-table-scroll::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)' : 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)'};
        }
      `}</style>
      <div className="overflow-x-auto modern-table-scroll">
        <table className="w-full min-w-[640px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className={`bg-gradient-to-r ${isDark ? 'from-purple-600/30 via-blue-600/30 to-cyan-600/30 border-b border-purple-500/30' : 'from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-blue-200'}`}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-4 text-left text-sm font-bold ${isDark ? 'text-purple-100' : 'text-blue-900'} ${header.column.getCanSort() ? 'cursor-pointer select-none group hover:bg-white/10 transition-colors' : ''}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className={`inline-block transition-all duration-200 ${
                          header.column.getIsSorted() 
                            ? 'opacity-100' 
                            : 'opacity-0 group-hover:opacity-60'
                        }`}>
                          {header.column.getIsSorted() === 'desc' ? (
                            <FiChevronDown className="w-4 h-4" />
                          ) : header.column.getIsSorted() === 'asc' ? (
                            <FiChevronUp className="w-4 h-4" />
                          ) : (
                            <FiChevronDown className="w-4 h-4 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={`divide-y ${borderColor}`}>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`${rowHover} ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 text-sm ${textMain}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`px-4 py-8 text-center ${textSub}`}
                >
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t ${borderColor} bg-opacity-50`}>
        <div className={`text-sm ${textSub}`}>
          Menampilkan <span className="font-semibold">{startItem}</span> - <span className="font-semibold">{endItem}</span> dari{' '}
          <span className="font-semibold">{totalItems}</span> data
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 1
                ? isDark
                  ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-white/5'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark
                ? 'bg-[#181926]/80 text-gray-300 border border-white/10 hover:bg-purple-500/20 hover:text-purple-300 hover:shadow-lg hover:shadow-purple-500/10'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md'
            }`}
          >
            <FiChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <div className={`px-5 py-2 rounded-lg text-sm font-semibold ${
            isDark 
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            Halaman {currentPage} dari {totalPages}
          </div>

          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === totalPages
                ? isDark
                  ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-white/5'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark
                ? 'bg-[#181926]/80 text-gray-300 border border-white/10 hover:bg-purple-500/20 hover:text-purple-300 hover:shadow-lg hover:shadow-purple-500/10'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md'
            }`}
          >
            <span>Berikutnya</span>
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
