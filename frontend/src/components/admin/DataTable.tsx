import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Column<T> {
 header: string;
 accessor: keyof T | ((item: T) => ReactNode);
 className?: string;
}

interface DataTableProps<T> {
 columns: Column<T>[];
 data: T[];
 keyExtractor: (item: T) => string;
 onRowClick?: (item: T) => void;
 isLoading?: boolean;
 isFetching?: boolean;
}

export function DataTable<T>({ columns, data, keyExtractor, onRowClick, isLoading = false, isFetching = false }: DataTableProps<T>) {
 return (
 <div className="bg-bg-card/40 backdrop-blur-xl rounded-2xl border border-border-subtle overflow-hidden shadow-soft relative">
 {isFetching && !isLoading && (
  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary animate-pulse z-10" />
 )}
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-bg-secondary/50 border-b border-border-subtle">
 {columns.map((col, idx) => (
 <th key={idx} className={`px-5 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}>
 {col.header}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-border-subtle">
 {isLoading ? (
  Array.from({ length: 5 }).map((_, rowIdx) => (
    <tr key={rowIdx} className="animate-pulse">
      {columns.map((_, colIdx) => (
        <td key={colIdx} className="px-5 py-4">
          <div className="h-5 bg-bg-secondary rounded-lg w-full max-w-[120px] relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />
          </div>
        </td>
      ))}
    </tr>
  ))
) : data.length === 0 ? (
 <tr>
 <td colSpan={columns.length} className="px-6 py-12 text-center text-text-secondary">
 No data available.
 </td>
 </tr>
 ) : (
 data.map((item, idx) => (
 <motion.tr 
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
 key={keyExtractor(item)} 
 onClick={() => onRowClick?.(item)}
 className={`group transition-all ${
 onRowClick 
 ? 'cursor-pointer hover:bg-bg-secondary/50 hover:shadow-[inset_2px_0_0_0_#15d8ff]'
 : 'hover:bg-bg-secondary/50'
 }`}
 >
 {columns.map((col, colIdx) => (
 <td key={colIdx} className={`px-5 py-4 text-sm text-text-primary ${col.className || ''}`}>
 {typeof col.accessor === 'function'
 ? col.accessor(item) 
 : (item[col.accessor] as unknown as ReactNode)}
 </td>
 ))}
 </motion.tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
}
