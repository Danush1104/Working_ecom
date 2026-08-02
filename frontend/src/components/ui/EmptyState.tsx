import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
 icon: LucideIcon;
 title: string;
 description: string;
 action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col items-center justify-center p-8 md:p-12 text-center"
 >
 <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-secondary text-text-secondary mb-6">
 <Icon className="h-10 w-10" />
 </div>
 <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
 <p className="text-text-secondary dark:text-text-secondary max-w-sm mb-6">{description}</p>
 {action && <div>{action}</div>}
 </motion.div>
 );
}
