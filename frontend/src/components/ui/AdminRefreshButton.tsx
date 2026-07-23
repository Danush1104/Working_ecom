import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminRefreshButtonProps {
  onRefresh: () => Promise<any>;
  isRefetching?: boolean;
}

export function AdminRefreshButton({ onRefresh, isRefetching }: AdminRefreshButtonProps) {
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    updateTimestamp();
  }, []);

  const updateTimestamp = () => {
    const now = new Date();
    setLastRefreshed(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleRefresh = async () => {
    setIsSpinning(true);
    try {
      await onRefresh();
    } finally {
      updateTimestamp();
      setTimeout(() => setIsSpinning(false), 500);
    }
  };

  const spinning = isRefetching || isSpinning;

  return (
    <div className="flex items-center gap-3">
      {lastRefreshed && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Last refreshed: {lastRefreshed}
        </span>
      )}
      <button
        onClick={handleRefresh}
        disabled={spinning}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        <motion.div
          animate={{ rotate: spinning ? 360 : 0 }}
          transition={{ duration: 1, repeat: spinning ? Infinity : 0, ease: "linear" }}
        >
          <RefreshCw className="h-4 w-4" />
        </motion.div>
        {spinning ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
}
