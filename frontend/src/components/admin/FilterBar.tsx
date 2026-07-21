import { Filter, Search, Plus } from 'lucide-react';

interface FilterBarProps {
  placeholder?: string;
  onSearch?: (val: string) => void;
  onAdd?: () => void;
  addLabel?: string;
}

export function FilterBar({ placeholder = "Search...", onSearch, onAdd, addLabel = "Add New" }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
      <div className="relative w-full sm:w-96 flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input 
          type="text" 
          placeholder={placeholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>
      <div className="flex w-full sm:w-auto items-center gap-3">
        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-colors text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filter
        </button>
        {onAdd && (
          <button 
            onClick={onAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
