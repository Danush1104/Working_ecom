import { motion } from 'framer-motion';

interface PlaceholderPageProps {
 title: string;
 description?: string;
}

export default function PlaceholderPage({ title, description ="This page is currently under construction for Phase 1." }: PlaceholderPageProps) {
 return (
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
 >
 <div className="bg-bg-card dark:bg-bg-card p-8 md:p-12 rounded-3xl shadow-soft max-w-md w-full border border-border-subtle dark:border-border-subtle">
 <h1 className="text-2xl font-bold text-text-primary mb-2">{title}</h1>
 <p className="text-text-secondary dark:text-text-secondary">{description}</p>
 </div>
 </motion.div>
 );
}
