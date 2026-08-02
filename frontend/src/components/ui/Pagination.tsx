import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
 currentPage: number;
 totalPages: number;
 onPageChange: (page: number) => void;
 className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className = ''}: PaginationProps) {
 // Simple pagination logic for placeholder
 const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1);

 return (
 <div className={`flex items-center justify-center gap-2 ${className}`}>
 <button 
 onClick={() => onPageChange(currentPage - 1)}
 disabled={currentPage === 1}
 className="p-2 rounded-lg border border-border-subtle bg-bg-card text-text-secondary hover:bg-bg-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronLeft className="h-5 w-5" />
 </button>
 
 {pages.map(page => (
 <button
 key={page}
 onClick={() => onPageChange(page)}
 className={`h-10 w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
 currentPage === page 
 ? 'bg-primary text-bg-primary border-primary'
 : 'border border-border-subtle bg-bg-card text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
 }`}
 >
 {page}
 </button>
 ))}

 {totalPages > 5 && (
 <div className="flex h-10 w-10 items-center justify-center text-text-secondary">
 <MoreHorizontal className="h-5 w-5" />
 </div>
 )}

 <button 
 onClick={() => onPageChange(currentPage + 1)}
 disabled={currentPage === totalPages}
 className="p-2 rounded-lg border border-border-subtle bg-bg-card text-text-secondary hover:bg-bg-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronRight className="h-5 w-5" />
 </button>
 </div>
 );
}
