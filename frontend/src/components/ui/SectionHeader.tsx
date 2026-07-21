import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  actionLink?: string;
  actionText?: string;
}

export function SectionHeader({ title, actionLink, actionText = 'View All' }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
      {actionLink && (
        <Link 
          to={actionLink} 
          className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1 -mr-2"
        >
          {actionText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
