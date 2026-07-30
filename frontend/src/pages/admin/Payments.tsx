import { useState } from 'react';
import { motion } from 'framer-motion';
import { Undo2, AlertCircle } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { FilterDrawer } from '../../components/admin/FilterDrawer';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminPayments, useRefundPayment } from '../../hooks/usePayments';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/currency';
import { Pagination } from '../../components/ui/Pagination';
import { DetailDrawer } from '../../components/admin/DetailDrawer';
import { exportToCSV } from '../../utils/csv';

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const itemsPerPage = 10;
  
  const { data: payments, isLoading, isError } = useAdminPayments();

  // Data pipeline: Filter -> Search -> Sort -> Paginate
  const processedPayments = Array.isArray(payments) ? payments.filter(p => {
    let match = true;
    if (searchQuery) {
      match = match && (p.payment_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
             p.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.user_id.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      match = match && p.payment_status === statusFilter;
    }
    return match;
  }).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()) : [];

  const totalPages = Math.ceil(processedPayments.length / itemsPerPage);
  const paginatedPayments = processedPayments.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
      accessor: (item: any) => (
        <span className="font-medium text-gray-900 dark:text-white" title={item.payment_id}>
          {item.payment_id.length > 13 ? `${item.payment_id.slice(0, 13)}...` : item.payment_id}
        </span>
      ) 
    },
    {
      header: 'Order ID',
      accessor: (item: any) => (
        <span className="text-gray-600 dark:text-gray-300" title={item.order_id}>
          {item.order_id.length > 13 ? `${item.order_id.slice(0, 13)}...` : item.order_id}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="text-gray-900 dark:text-gray-100 font-medium" title={item.customer_username || item.user_id}>
            {(item.customer_username || item.user_id).length > 15 ? `${(item.customer_username || item.user_id).slice(0, 15)}...` : (item.customer_username || item.user_id)}
          </span>
          {item.customer_email && (
            <span className="text-xs text-gray-500 dark:text-gray-400" title={item.customer_email}>
              {item.customer_email.length > 20 ? `${item.customer_email.slice(0, 20)}...` : item.customer_email}
            </span>
          )}
        </div>
      )
    },
    { 
      header: 'Date', 
      accessor: (item: any) => {
        if (!item.created_at) return 'N/A';
        const sanitized = item.created_at.replace(' ', 'T').replace(',', '.');
        const d = new Date(sanitized);
        if (isNaN(d.getTime())) return 'Invalid Date';
        return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
      }
    },
    { 
      header: 'Amount', 
      accessor: (item: any) => formatCurrency(item.amount)
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
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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



  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Payments</h1>
      </div>

      <FilterBar 
        placeholder="Search payments by ID, Order ID or Customer..." 
        onSearch={(val) => { setSearchQuery(val); setPage(1); }}
        onFilterClick={() => setIsFilterOpen(true)}
        onDownload={() => exportToCSV(processedPayments, 'payments.csv')}
      />

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onReset={() => setStatusFilter('all')}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 outline-none focus:ring-1 focus:ring-primary dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </FilterDrawer>

      <DataTable 
        columns={columns} 
        data={paginatedPayments} 
        keyExtractor={(item) => item.payment_id}
        onRowClick={(item) => {
          setSelectedPayment(item);
          setIsViewModalOpen(true);
        }}
      />
      {totalPages > 1 && (
        <div className="mt-6 flex justify-end">
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </div>
      )}

      <DetailDrawer
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Payment Details"
        fields={selectedPayment ? [
          { label: 'Payment ID', value: selectedPayment.payment_id },
          { label: 'Order ID', value: selectedPayment.order_id },
          { label: 'Customer Name', value: selectedPayment.customer_username || '—' },
          { label: 'Customer Email', value: selectedPayment.customer_email || '—' },
          { label: 'User ID', value: selectedPayment.user_id },
          { label: 'Amount', value: formatCurrency(selectedPayment.amount) },
          { label: 'Payment Method', value: selectedPayment.payment_method },
          { label: 'Status', value: selectedPayment.payment_status },
          { label: 'Created At', value: new Date(selectedPayment.created_at || '').toLocaleString() },
          { label: 'Updated At', value: new Date(selectedPayment.updated_at || '').toLocaleString() }
        ] : []}
      />
    </motion.div>
  );
}
