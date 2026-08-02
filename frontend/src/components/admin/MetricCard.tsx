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
  let isCurrency = false;
  let numericValue = 0;
  
  if (typeof value === 'string') {
    isCurrency = value.includes('₹');
    numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
  } else {
    numericValue = value;
  }

  const formatCompact = (num: number, isCurr: boolean) => {
    if (isNaN(num)) return value;
    if (isCurr) {
      if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2).replace(/\.00$/, '') + 'Cr';
      if (num >= 100000) return '₹' + (num / 100000).toFixed(2).replace(/\.00$/, '') + 'L';
      if (num >= 10000) return '₹' + (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
      if (num >= 10000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return value;
  };

  const displayValue = formatCompact(numericValue, isCurrency);
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
  <div className="mt-auto relative group">
    <div className="text-2xl md:text-3xl font-space font-bold text-text-primary tracking-tight truncate" title={String(value)}>
      {displayValue}
    </div>
    
    {/* Tooltip for exact value */}
    {displayValue !== value && (
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
        <div className="bg-bg-primary text-text-primary text-xs rounded-lg py-1.5 px-3 border border-border-subtle shadow-lg whitespace-nowrap">
          {value}
        </div>
      </div>
    )}
 {trend && (
 <div className="mt-2 flex items-center text-xs">
 <span className={`font-medium ${trend.isPositive ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]': 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]'}`}>
 {trend.value}
 </span>
 <span className="text-text-secondary/70 ml-2">vs last month</span>
 </div>
 )}
 </div>
 </motion.div>
 );
}
