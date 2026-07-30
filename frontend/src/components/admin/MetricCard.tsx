import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-bg-card/40 backdrop-blur-xl rounded-2xl p-6 border border-border-subtle flex flex-col hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(21,216,255,0.05)] transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-[inset_0_0_10px_rgba(21,216,255,0.1)]">
          {icon}
        </div>
      </div>
      <div className="mt-auto">
        <div className="text-2xl md:text-3xl font-space font-bold text-white tracking-tight">{value}</div>
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            <span className={`font-medium ${trend.isPositive ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]'}`}>
              {trend.value}
            </span>
            <span className="text-text-secondary/70 ml-2">vs last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
