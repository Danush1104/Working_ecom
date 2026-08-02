import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import { useProducts } from '../../hooks/useProducts';
import { useCreateOrder } from '../../hooks/useOrders';
import type { CheckoutPayload } from '../../api/orderService';
import { PriceTag } from '../../components/ui/PriceTag';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/currency';

const PAYMENT_METHODS = [
 { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
 { id: 'UPI', label: 'UPI', icon: Smartphone },
 { id: 'NET_BANKING', label: 'Net Banking', icon: ShieldCheck },
 { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
];

export default function Checkout() {
 const { user } = useAuth();
 const navigate = useNavigate();
 
 const { data: cartItems, isLoading: isLoadingCart } = useCart(user?.userId);
 const { data: products, isLoading: isLoadingProducts } = useProducts();
 const createOrderMutation = useCreateOrder(user?.userId);

 const [email, setEmail] = useState(user?.email || '');
 const [paymentMethod, setPaymentMethod] = useState('CARD');

 const items = cartItems || [];
 
 const enrichedCart = items.map(item => {
 const product = products?.find(p => p.id === item.product_id);
 return { ...item, product };
 }).filter(item => item.product);

 const totalPrice = enrichedCart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
 const tax = totalPrice * 0.08;
 const total = totalPrice + tax;

 useEffect(() => {
 if (!isLoadingCart && items.length === 0) {
 navigate('/cart');
 }
 }, [items.length, isLoadingCart, navigate]);

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (enrichedCart.length === 0) return;
 
 const payload: CheckoutPayload = {
 customer_email: email,
 customer_username: user?.username,
 payment_method: paymentMethod,
 };
 
 createOrderMutation.mutate(payload, {
 onSuccess: (data) => {
 navigate(`/payment/${data.order_id}`);
 }
 });
 };

 if (isLoadingCart || isLoadingProducts) {
 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 <Skeleton className="h-10 w-48 mb-8" />
 <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
 <Skeleton className="h-96 w-full rounded-3xl" />
 <Skeleton className="h-96 w-full rounded-3xl" />
 </div>
 </div>
 );
 }



 return (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pb-8"
 >
 <h1 className="text-4xl font-playfair font-bold text-text-primary mb-8">Checkout</h1>
 
 <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start relative">
 {/* Form Section */}
 <div className="space-y-8">
 <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
 <div className="bg-bg-card dark:bg-bg-card p-6 md:p-8 rounded-[32px] shadow-soft border border-border-subtle dark:border-border-subtle">
 <h2 className="text-xl font-semibold text-text-primary mb-6">Contact Information</h2>
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
 Email Address
 </label>
 <input
 type="email"
 id="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full px-4 py-3 rounded-xl border border-border-subtle dark:border-border-subtle bg-bg-card dark:bg-bg-primary text-bg-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
 placeholder="Enter your email"
 />
 </div>
 </div>

 <div className="bg-bg-card dark:bg-bg-card p-6 md:p-8 rounded-[32px] shadow-soft border border-border-subtle dark:border-border-subtle">
 <h2 className="text-xl font-semibold text-text-primary mb-6">Payment Method</h2>
 <div className="space-y-3">
 {PAYMENT_METHODS.map((method) => (
 <label 
 key={method.id} 
 className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${
 paymentMethod === method.id 
 ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-[0_0_15px_rgba(21,216,255,0.15)]'
 : 'border-border-subtle dark:border-border-subtle hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(21,216,255,0.08)]'
 }`}
 >
 <input 
 type="radio" 
 name="payment_method" 
 value={method.id}
 checked={paymentMethod === method.id}
 onChange={(e) => setPaymentMethod(e.target.value)}
 className="sr-only"
 />
 <method.icon className={`h-6 w-6 mr-4 ${paymentMethod === method.id ? 'text-primary': 'text-text-secondary'}`} />
 <span className="font-medium text-text-primary">{method.label}</span>
 <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-primary': 'border-border-subtle dark:border-gray-600'}`}>
 {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
 </div>
 </label>
 ))}
 </div>
 </div>
 </form>
 </div>

 {/* Order Summary */}
 <div className="bg-bg-card dark:bg-bg-card p-6 md:p-8 rounded-[32px] shadow-soft border border-border-subtle dark:border-border-subtle lg:sticky lg:top-24">
 <h2 className="text-xl font-playfair font-bold text-text-primary mb-6">Order Summary</h2>
 
 <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
 {enrichedCart.map((item) => (
 <div key={item.product_id} className="flex items-center gap-4">
 <div className="w-16 h-16 rounded-xl bg-bg-secondary dark:bg-bg-primary overflow-hidden shrink-0">
 <img 
 src={item.product!.image_url || 'https://via.placeholder.com/100'} 
 alt={item.product!.name}
 className="w-full h-full object-cover"
 />
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-medium text-text-primary truncate">{item.product!.name}</h4>
 <p className="text-sm text-text-secondary dark:text-text-secondary">Qty: {item.quantity}</p>
 </div>
 <PriceTag price={item.product!.price * item.quantity} size="sm" />
 </div>
 ))}
 </div>
 
 <div className="space-y-4 text-sm mb-6 pt-6 border-t border-border-subtle dark:border-border-subtle">
 <div className="flex justify-between text-text-secondary dark:text-text-secondary">
 <span>Subtotal</span>
 <span className="font-medium text-text-primary">{formatCurrency(totalPrice)}</span>
 </div>
 <div className="flex justify-between text-text-secondary dark:text-text-secondary">
 <span>Estimated Tax (8%)</span>
 <span className="font-medium text-text-primary">{formatCurrency(tax)}</span>
 </div>
 <div className="flex justify-between text-text-secondary dark:text-text-secondary">
 <span>Shipping</span>
 <span className="font-medium text-green-600 dark:text-green-400">Free</span>
 </div>
 </div>
 
 <div className="border-t border-border-subtle dark:border-border-subtle pt-4 mb-6">
 <div className="flex justify-between items-end mb-1">
 <span className="font-playfair font-bold text-lg text-text-primary">Total</span>
 <span className="text-2xl font-bold text-text-primary">{formatCurrency(total)}</span>
 </div>
 </div>
 
 <button 
 type="submit"
 form="checkout-form"
 disabled={createOrderMutation.isPending || enrichedCart.length === 0}
 className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-bg-primary rounded-xl font-space font-bold uppercase tracking-wider hover:bg-primary-hover hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-[0_4px_20px_rgba(21,216,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {createOrderMutation.isPending ? 'Processing...': 'Place Order'}
 {!createOrderMutation.isPending && <ArrowRight className="h-5 w-5" />}
 </button>
 </div>
 </div>
 </motion.div>
 );
}
