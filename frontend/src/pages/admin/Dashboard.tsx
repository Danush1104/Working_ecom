import { motion } from 'framer-motion';
import { Package, CheckCircle, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';
import { MetricCard } from '../../components/admin/MetricCard';

export default function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">Last updated: Just now</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Products" 
          value="1,248" 
          icon={<Package className="h-5 w-5" />} 
          trend={{ value: '+12%', isPositive: true }}
        />
        <MetricCard 
          title="Active Products" 
          value="1,102" 
          icon={<CheckCircle className="h-5 w-5" />} 
          trend={{ value: '+5%', isPositive: true }}
        />
        <MetricCard 
          title="Total Orders" 
          value="3,842" 
          icon={<ShoppingBag className="h-5 w-5" />} 
          trend={{ value: '+24%', isPositive: true }}
        />
        <MetricCard 
          title="Total Revenue" 
          value="$128,450.00" 
          icon={<DollarSign className="h-5 w-5" />} 
          trend={{ value: '+18%', isPositive: true }}
        />
        <MetricCard 
          title="Low Stock Items" 
          value="14" 
          icon={<AlertTriangle className="h-5 w-5" />} 
          trend={{ value: '-2', isPositive: true }}
        />
      </div>
    </motion.div>
  );
}
