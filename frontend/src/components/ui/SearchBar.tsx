import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
 placeholder?: string;
 onSearch?: (query: string) => void;
 className?: string;
}

export function SearchBar({ placeholder = 'Search...', onSearch, className = ''}: SearchBarProps) {
 const [query, setQuery] = useState('');

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const val = e.target.value;
 setQuery(val);
 if (onSearch) {
 onSearch(val);
 }
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (onSearch) onSearch(query);
 };

 return (
 <form onSubmit={handleSubmit} className={`relative flex items-center w-full ${className}`}>
 <Search className="absolute left-4 h-5 w-5 text-text-secondary dark:text-text-secondary" />
 <input id="input_nsgw" 
 type="text"
 value={query}
 onChange={handleChange}
 placeholder={placeholder}
 aria-label="Search"
 className="h-12 w-full rounded-full border border-border-subtle dark:border-border-subtle bg-bg-card dark:bg-bg-card pl-12 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 transition-all shadow-sm text-text-primary placeholder:text-text-secondary dark:placeholder:text-text-secondary dark:text-text-secondary"
 />
 {query && (
 <button 
 type="button" 
 aria-label="Clear search"
 onClick={() => setQuery('')}
 className="absolute right-4 p-1 text-text-secondary dark:text-text-secondary dark:text-text-secondary hover:text-text-secondary dark:hover:text-text-secondary rounded-full hover:bg-bg-secondary dark:bg-bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <X className="h-4 w-4" />
 </button>
 )}
 </form>
 );
}
