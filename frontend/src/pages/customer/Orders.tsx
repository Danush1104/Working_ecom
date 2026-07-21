import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Package, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrders, useCancelOrder } from '../../hooks/useOrders';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import type { Order } from '../../api/orderService';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { usePaymentsByOrder } from '../../hooks/usePayments';
import { Link } from 'react-router-dom';

export default function Orders() {
  const { user } = useAuth();
  const { data: orders, isLoading, isError } = useOrders(user?.userId);
  const cancelOrderMutation = useCancelOrder(user?.userId);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const { data: orderPayments, isLoading: isLoadingPayments } = usePaymentsByOrder(selectedOrder?.order_id);
  const latestPayment = orderPayments && orderPayments.length > 0 ? orderPayments[orderPayments.length - 1] : null;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48 mb-8" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to load orders</h2>
        <p className="text-gray-500 dark:text-gray-400">Please try refreshing the page.</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState 
          icon={ShoppingBag}
          title="No orders yet"
          description="When you place orders, they will appear here."
        />
      </div>
    );
  }

  const handleCancel = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate(orderId);
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, order_status: 'CANCELLED' } : null);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div 
            key={order.order_id} 
            onClick={() => setSelectedOrder(order)}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Order {order.order_id}</span>
                  <StatusBadge status={order.order_status} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xl font-bold text-gray-900 dark:text-white">${order.total_amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} item(s)</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Package className="h-4 w-4" />
                <span>Payment: <StatusBadge status={order.payment_status} /></span>
              </div>
              
              {order.order_status === 'PENDING' && (
                <button
                  onClick={(e) => handleCancel(order.order_id, e)}
                  disabled={cancelOrderMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Details</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 break-all pr-4">{selectedOrder.order_id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <StatusBadge status={selectedOrder.order_status} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payment</p>
                    <StatusBadge status={selectedOrder.payment_status} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Method</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{item.product_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">${Number(item.subtotal).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Details</h3>
                  {isLoadingPayments ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : latestPayment ? (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                        <span className="text-gray-500 dark:text-gray-400">Payment ID</span>
                        <span className="font-medium text-gray-900 dark:text-white sm:col-span-2 break-all">{latestPayment.payment_id}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                        <span className="text-gray-500 dark:text-gray-400">Amount</span>
                        <span className="font-medium text-gray-900 dark:text-white sm:col-span-2">${Number(latestPayment.amount).toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-center">
                        <span className="text-gray-500 dark:text-gray-400">Status</span>
                        <div className="sm:col-span-2"><StatusBadge status={latestPayment.payment_status} /></div>
                      </div>
                      {latestPayment.payment_status === 'FAILED' && (
                        <div className="pt-3 flex justify-end">
                          <Link 
                            to={`/payment/${selectedOrder.order_id}`}
                            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
                          >
                            Retry Payment
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No payment records found.</p>
                      {selectedOrder.order_status === 'PENDING' && (
                        <Link 
                          to={`/payment/${selectedOrder.order_id}`}
                          className="inline-block px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm"
                        >
                          Make Payment
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
