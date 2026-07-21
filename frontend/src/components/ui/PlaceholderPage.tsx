import { motion } from 'framer-motion';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description = "This page is currently under construction for Phase 1." }: PlaceholderPageProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-3xl shadow-soft max-w-md w-full border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
}
