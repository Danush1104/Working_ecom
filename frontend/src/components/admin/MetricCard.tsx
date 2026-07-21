import type { ReactNode } from 'react';

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
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-300">
          {icon}
        </div>
      </div>
      <div className="mt-auto">
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
        {trend && (
          <div className="mt-2 flex items-center text-sm">
            <span className={`font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </span>
            <span className="text-gray-400 ml-2">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
