import { motion } from 'framer-motion';
import { Eye, AlertCircle, ShoppingBag } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminOrders } from '../../hooks/useOrders';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Order } from '../../api/orderService';

export default function Orders() {
  const { data: orders, isLoading, isError } = useAdminOrders();

  const columns: any[] = [
    { 
      header: 'Order ID', 
      accessor: (item: Order) => <span className="font-medium text-gray-900 dark:text-white">{item.order_id}</span> 
    },
    {
      header: 'Customer',
      accessor: (item: Order) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">{item.user_id}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{item.customer_email}</span>
        </div>
      )
    },
    { 
      header: 'Date', 
      accessor: (item: Order) => new Date(item.created_at).toLocaleDateString()
    },
    { 
      header: 'Total', 
      accessor: (item: Order) => `$${Number(item.total_amount).toFixed(2)}` 
    },
    { 
      header: 'Payment', 
      accessor: (item: Order) => <StatusBadge status={item.payment_status} />
    },
    { 
      header: 'Status', 
      accessor: (item: Order) => <StatusBadge status={item.order_status} />
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: () => (
        <button className="p-1.5 text-gray-400 hover:text-primary transition-colors">
          <Eye className="h-4 w-4" />
        </button>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
        </div>
        <FilterBar placeholder="Search orders by ID, email or name..." />
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error loading orders</h2>
        <p className="text-gray-500 dark:text-gray-400">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Orders</h1>
      </div>

      <FilterBar placeholder="Search orders by ID, email or name..." />

      {!orders || orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-16 shadow-sm border border-gray-100 dark:border-gray-700">
          <EmptyState 
            icon={ShoppingBag}
            title="No orders found"
            description="There are currently no orders in the system."
          />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={orders} 
          keyExtractor={(item: Order) => item.order_id} 
        />
      )}
    </motion.div>
  );
}
