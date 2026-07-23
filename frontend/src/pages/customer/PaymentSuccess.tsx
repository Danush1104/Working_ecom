import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../hooks/useOrders';
import { usePayment } from '../../hooks/usePayments';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/currency';

export default function PaymentSuccess() {
  const { orderId, paymentId } = useParams<{ orderId: string, paymentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: order, isLoading: isLoadingOrder, isError: isOrderError } = useOrder(user?.userId, orderId);
  const { data: payment, isLoading: isLoadingPayment, isError: isPaymentError } = usePayment(paymentId);

  if (isLoadingOrder || isLoadingPayment) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 space-y-6 flex flex-col items-center">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }

  if (isOrderError || isPaymentError || !order || !payment) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Details</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">We could not load your payment success details.</p>
        <button 
          onClick={() => navigate('/orders')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          View My Orders
        </button>
      </div>
    );
  }

  // If we ended up here but payment isn't SUCCESS
  if (payment.payment_status !== 'SUCCESS') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Not Completed</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your payment status is currently {payment.payment_status}. 
        </p>
        <button 
          onClick={() => navigate(`/payment/${orderId}`)}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          Return to Payment
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto py-24 px-4 text-center"
    >
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Payment Successful!</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Thank you for your purchase. Your payment of {formatCurrency(payment.amount)} was received and your order is now being processed.
      </p>
      
      <div className="bg-white dark:bg-bg-card border border-gray-100 dark:border-border-subtle p-8 rounded-[32px] shadow-soft max-w-md mx-auto mb-8 text-left space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-100 dark:border-border-subtle pb-3">
          <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
          <span className="font-medium text-gray-900 dark:text-white sm:col-span-2 break-all">{order.order_id}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-gray-100 dark:border-border-subtle pb-3">
          <span className="text-gray-500 dark:text-gray-400">Payment ID:</span>
          <span className="font-medium text-gray-900 dark:text-white sm:col-span-2 break-all">{payment.payment_id}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-center">
          <span className="text-gray-500 dark:text-gray-400">Method:</span>
          <span className="font-medium text-gray-900 dark:text-white sm:col-span-2">{payment.payment_method}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={() => navigate('/orders')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          View My Orders
        </button>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </motion.div>
  );
}
