import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../hooks/useOrders';
import { usePaymentsByOrder, useCreatePayment, useProcessPayment } from '../../hooks/usePayments';
import { Skeleton } from '../../components/ui/Skeleton';

export default function Payment() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: order, isLoading: isLoadingOrder, isError: isOrderError } = useOrder(user?.userId, orderId);
  const { data: existingPayments, isLoading: isLoadingPayments } = usePaymentsByOrder(orderId);
  
  const createPaymentMutation = useCreatePayment();
  const processPaymentMutation = useProcessPayment();
  
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize Payment (reuse existing if pending/failed)
  useEffect(() => {
    if (isLoadingOrder || isLoadingPayments || !order) return;
    
    // Check for existing payments
    const pendingOrFailed = existingPayments?.find(p => p.payment_status === 'PENDING' || p.payment_status === 'FAILED');
    
    if (pendingOrFailed) {
      setPaymentId(pendingOrFailed.payment_id);
      setIsInitializing(false);
    } else if (existingPayments?.some(p => p.payment_status === 'SUCCESS')) {
      // Already paid successfully
      navigate(`/orders`);
    } else if (order.order_status === 'PENDING' && !paymentId && !createPaymentMutation.isPending) {
      // Create new payment
      createPaymentMutation.mutate({
        order_id: order.order_id,
        amount: Number(order.total_amount)
      }, {
        onSuccess: (data) => {
          setPaymentId(data.payment_id);
          setIsInitializing(false);
        },
        onError: (err: any) => {
          setErrorMsg(err.message || 'Failed to initialize payment');
          setIsInitializing(false);
        }
      });
    } else {
      setIsInitializing(false);
    }
  }, [isLoadingOrder, isLoadingPayments, order, existingPayments, createPaymentMutation, paymentId, navigate]);

  const handleProcessPayment = (status: 'SUCCESS' | 'FAILED') => {
    if (!paymentId) return;
    
    setErrorMsg(null);
    processPaymentMutation.mutate({
      paymentId,
      payload: { payment_status: status }
    }, {
      onSuccess: () => {
        if (status === 'SUCCESS') {
          navigate(`/payment-success/${orderId}/${paymentId}`);
        } else {
          setErrorMsg('Payment failed. Please try again.');
        }
      },
      onError: (err: any) => {
        setErrorMsg(err.message || 'Error processing payment');
      }
    });
  };

  if (isLoadingOrder || isInitializing) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    );
  }

  if (isOrderError || !order) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">We could not find the order you are trying to pay for.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto py-16 px-4"
    >
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Payment</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Order {order.order_id}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
            <span className="font-semibold text-gray-900 dark:text-white">${Number(order.total_amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
            <span className="font-semibold text-gray-900 dark:text-white">{order.payment_method}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleProcessPayment('SUCCESS')}
            disabled={processPaymentMutation.isPending || !paymentId}
            className="w-full flex items-center justify-center gap-2 h-14 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {processPaymentMutation.isPending ? 'Processing...' : `Pay $${Number(order.total_amount).toFixed(2)}`}
            {!processPaymentMutation.isPending && <ArrowRight className="h-5 w-5" />}
          </button>
          
          <button
            onClick={() => navigate('/orders')}
            className="w-full h-14 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
          >
            Cancel Payment
          </button>
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure checkout provided by standard backend</span>
        </div>
      </div>
    </motion.div>
  );
}
