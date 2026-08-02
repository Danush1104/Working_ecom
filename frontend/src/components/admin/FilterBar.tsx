import { Filter, Search, Plus, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface FilterBarProps {
 placeholder?: string;
 onSearch?: (val: string) => void;
 onFilterClick?: () => void;
 onAdd?: () => void;
 onDownload?: () => void;
 addLabel?: string;
}

export function FilterBar({ placeholder ="Search...", onSearch, onFilterClick, onAdd, onDownload, addLabel ="Add New" }: FilterBarProps) {
 return (
 <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-bg-card/40 backdrop-blur-xl p-3 rounded-2xl shadow-soft border border-border-subtle mb-6">
 <div className="relative w-full sm:w-80 flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
 <input 
 type="text" 
 placeholder={placeholder}
 onChange={(e) => onSearch?.(e.target.value)}
 className="h-10 w-full rounded-xl border border-border-subtle bg-bg-primary/50 pl-10 pr-4 text-sm text-text-primary placeholder-text-secondary/50 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
 />
 </div>
 <div className="flex w-full sm:w-auto items-center gap-2 flex-wrap sm:flex-nowrap">
 <button 
 onClick={onFilterClick}
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-secondary hover:border-border-subtle transition-all text-sm font-medium focus:outline-none"
 >
 <Filter className="h-4 w-4" />
 Filter
 </button>
 {onDownload && (
 <button 
 onClick={onDownload}
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-secondary hover:border-border-subtle transition-all text-sm font-medium focus:outline-none"
 title="Download CSV"
 >
 <Download className="h-4 w-4" />
 CSV
 </button>
 )}
 {onAdd && (
 <motion.button 
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={onAdd}
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-primary text-bg-primary hover:bg-primary-hover hover:shadow-[0_0_15px_rgba(21,216,255,0.4)] transition-all text-sm font-bold focus:outline-none"
 >
 <Plus className="h-4 w-4" />
 {addLabel}
 </motion.button>
 )}
 </div>
 </div>
 );
}
