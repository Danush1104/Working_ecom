import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Undo2, AlertCircle } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminPayments, useRefundPayment } from '../../hooks/usePayments';
import { Skeleton } from '../../components/ui/Skeleton';

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: payments, isLoading, isError } = useAdminPayments();
  const refundMutation = useRefundPayment();

  const handleRefund = (paymentId: string) => {
    if (confirm('Are you sure you want to refund this payment? This cannot be undone.')) {
      refundMutation.mutate(paymentId, {
        onError: (err: any) => {
          alert(`Refund failed: ${err.message}`);
        }
      });
    }
  };

  const columns: any[] = [
    { 
      header: 'Payment ID', 
      accessor: (item: any) => <span className="font-medium text-gray-900 dark:text-white">{item.payment_id}</span> 
    },
    {
      header: 'Order ID',
      accessor: (item: any) => <span className="text-gray-600 dark:text-gray-300">{item.order_id}</span>
    },
    {
      header: 'Customer',
      accessor: (item: any) => <span className="text-gray-600 dark:text-gray-300">{item.user_id}</span>
    },
    { 
      header: 'Date', 
      accessor: (item: any) => new Date(item.created_at).toLocaleDateString()
    },
    { 
      header: 'Amount', 
      accessor: (item: any) => `$${Number(item.amount).toFixed(2)}` 
    },
    {
      header: 'Method',
      accessor: (item: any) => <span className="text-gray-600 dark:text-gray-300">{item.payment_method}</span>
    },
    { 
      header: 'Status', 
      accessor: (item: any) => <StatusBadge status={item.payment_status} />
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (item: any) => (
        <div className="flex justify-end gap-2">
          {item.payment_status === 'SUCCESS' && (
            <button 
              onClick={() => handleRefund(item.payment_id)}
              disabled={refundMutation.isPending}
              className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Refund Payment"
            >
              <Undo2 className="h-4 w-4" />
            </button>
          )}
          <button className="p-1.5 text-gray-400 hover:text-primary transition-colors">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-red-500">
        <AlertCircle className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Failed to load payments</h2>
      </div>
    );
  }

  const filteredPayments = (payments || []).filter(p => 
    p.payment_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.order_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Payments</h1>
      </div>

      <FilterBar 
        placeholder="Search payments by ID or Order ID..." 
        onSearch={setSearchQuery}
      />

      <DataTable 
        columns={columns} 
        data={filteredPayments} 
        keyExtractor={(item) => item.payment_id} 
      />
    </motion.div>
  );
}
