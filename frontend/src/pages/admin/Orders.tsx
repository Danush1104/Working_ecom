import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ShoppingBag } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { FilterDrawer } from '../../components/admin/FilterDrawer';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAdminOrders } from '../../hooks/useOrders';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Order } from '../../api/orderService';
import { DetailDrawer } from '../../components/admin/DetailDrawer';

import { formatCurrency } from '../../utils/currency';
import { safeFormatDate } from '../../utils/date';
import { Pagination } from '../../components/ui/Pagination';
import { exportToCSV } from '../../utils/csv';

export default function Orders() {
 const { data: orders, isLoading, isError } = useAdminOrders();
 const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
 const [isViewModalOpen, setIsViewModalOpen] = useState(false);
 
 const [search, setSearch] = useState('');
 const [page, setPage] = useState(1);
 const [isFilterOpen, setIsFilterOpen] = useState(false);
 const [statusFilter, setStatusFilter] = useState('all');
 const itemsPerPage = 10;

 // Data pipeline: Filter -> Search -> Sort -> Paginate
 const processedOrders = Array.isArray(orders) ? orders.filter(o => {
 let match = true;
 if (search) {
 match = match && Boolean(o.order_id.toLowerCase().includes(search.toLowerCase()) || 
 o.user_id.toLowerCase().includes(search.toLowerCase()) ||
 (o.customer_email ? o.customer_email.toLowerCase().includes(search.toLowerCase()) : false));
 }
 if (statusFilter !== 'all') {
 match = match && o.order_status.toUpperCase() === statusFilter.toUpperCase();
 }
 return match;
 }).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()) : [];

 const totalPages = Math.ceil(processedOrders.length / itemsPerPage);
 const paginatedOrders = processedOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

 const columns: any[] = [
 { 
 header: 'Order ID', 
 accessor: (item: Order) => (
 <span className="font-medium text-text-primary" title={item.order_id}>
 {item.order_id.length > 13 ?`${item.order_id.slice(0, 13)}...` : item.order_id}
 </span>
 ) 
 },
 {
 header: 'Customer',
 accessor: (item: Order) => (
 <div className="flex flex-col">
 <span className="font-medium text-text-primary" title={(item as any).customer_username || item.user_id}>
 {((item as any).customer_username || item.user_id).length > 15 ?`${((item as any).customer_username || item.user_id).slice(0, 15)}...` : ((item as any).customer_username || item.user_id)}
 </span>
 <span className="text-xs text-text-secondary dark:text-text-secondary truncate max-w-[120px]" title={item.customer_email}>
 {item.customer_email}
 </span>
 </div>
 )
 },
 { 
 header: 'Date', 
 accessor: (item: Order) => {
 if (!item.created_at) return 'N/A';
 return safeFormatDate(item.created_at, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
 }
 },
 { 
 header: 'Total', 
 accessor: (item: Order) => formatCurrency(item.total_amount)
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
 accessor: () => null
 }
 ];

 if (isLoading) {
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <Skeleton className="h-8 w-32" />
 </div>
 <FilterBar placeholder="Search orders by ID, email or name..." />
 <div className="bg-bg-card/40 backdrop-blur-xl rounded-3xl p-6 shadow-soft border border-border-subtle space-y-4">
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
 <h2 className="text-xl font-bold text-text-primary mb-2">Error loading orders</h2>
 <p className="text-text-secondary dark:text-text-secondary">Please try refreshing the page.</p>
 </div>
 );
 }

 return (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
 <div className="flex items-center justify-between">
 <h1 className="text-2xl font-bold text-text-primary tracking-tight">Orders</h1>
 </div>

 <FilterBar 
 placeholder="Search orders (ID, User, Email)..." 
 onSearch={(val) => { setSearch(val); setPage(1); }}
 onFilterClick={() => setIsFilterOpen(true)}
 onDownload={() => exportToCSV(processedOrders, 'orders.csv')}
 />

 <FilterDrawer
 isOpen={isFilterOpen}
 onClose={() => setIsFilterOpen(false)}
 onReset={() => setStatusFilter('all')}
 >
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-2">Order Status</label>
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-full rounded-lg border border-border-subtle dark:border-border-subtle bg-bg-secondary dark:bg-bg-primary px-4 py-2 outline-none focus:ring-1 focus:ring-primary"
 >
 <option value="all">All Statuses</option>
 <option value="PENDING">Pending</option>
 <option value="PROCESSING">Processing</option>
 <option value="SHIPPED">Shipped</option>
 <option value="DELIVERED">Delivered</option>
 <option value="CANCELLED">Cancelled</option>
 </select>
 </div>
 </FilterDrawer>

 {!orders || orders.length === 0 ? (
 <div className="bg-bg-card/40 backdrop-blur-xl rounded-3xl p-16 shadow-soft border border-border-subtle">
 <EmptyState 
 icon={ShoppingBag}
 title="No orders found"
 description="There are currently no orders in the system."
 />
 </div>
 ) : processedOrders.length === 0 ? (
 <div className="bg-bg-card/40 backdrop-blur-xl rounded-3xl p-16 shadow-soft border border-border-subtle">
 <EmptyState 
 icon={ShoppingBag}
 title="No matches found"
 description="Try adjusting your search or filters."
 />
 </div>
 ) : (
 <>
 <DataTable 
 columns={columns} 
 data={paginatedOrders} 
 keyExtractor={(item: Order) => item.order_id} 
 onRowClick={(item) => {
 setSelectedOrder(item);
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
 </>
 )}

 <DetailDrawer
 isOpen={isViewModalOpen}
 onClose={() => setIsViewModalOpen(false)}
 title="Order Details"
 fields={selectedOrder ? [
 { label: 'Order ID', value: selectedOrder.order_id },
 { label: 'Customer', value: (selectedOrder as any).customer_username || selectedOrder.user_id },
 { label: 'User ID', value: selectedOrder.user_id },
 { label: 'Customer Email', value: selectedOrder.customer_email || 'N/A'},
 { label: 'Total Amount', value: formatCurrency(selectedOrder.total_amount) },
 { label: 'Order Status', value: selectedOrder.order_status },
 { label: 'Payment Status', value: selectedOrder.payment_status },
 { label: 'Created At', value: new Date(selectedOrder.created_at.replace('', 'T')).toLocaleString() },
 { label: 'Items', value: selectedOrder.items ? (
 <div className="space-y-2 mt-2">
 {selectedOrder.items.map((item, idx) => (
 <div key={idx} className="flex justify-between items-center text-sm p-3 bg-bg-secondary dark:bg-bg-card rounded-lg">
 <div>
 <p className="font-medium">{item.product_name || item.product_id}</p>
 <p className="text-text-secondary">Qty: {item.quantity}</p>
 </div>
 <p className="font-semibold">{formatCurrency(item.price)}</p>
 </div>
 ))}
 </div>
 ) : 'N/A'}
 ] : []}
 />
 </motion.div>
 );
}
