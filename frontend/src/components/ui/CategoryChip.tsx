import React from 'react';

interface CategoryChipProps {
 label: string;
 isActive?: boolean;
 onClick?: () => void;
 className?: string;
}

export const CategoryChip = React.memo(function CategoryChip({ label, isActive = false, onClick, className = ''}: CategoryChipProps) {
 return (
 <button
 onClick={onClick}
 aria-pressed={isActive}
 className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
 isActive 
 ? 'bg-primary text-bg-primary shadow-md'
 : 'bg-bg-card text-text-secondary border border-border-subtle hover:border-primary/50 hover:text-primary hover:border-primary/50 dark:hover:border-primary/50 hover:text-primary dark:hover:text-primary'
 } ${className}`}
 >
 {label}
 </button>
 );
});
