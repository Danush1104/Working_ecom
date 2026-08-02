import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuantitySelector } from '../../components/ui/QuantitySelector';
import { PriceTag } from '../../components/ui/PriceTag';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useCart, useUpdateCart, useRemoveCartItem } from '../../hooks/useCart';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/currency';
import { Skeleton } from '../../components/ui/Skeleton';

export default function Cart() {
 const { user, isAuthenticated } = useAuth();
 
 const { data: cartItems, isLoading: isLoadingCart, isError: isErrorCart } = useCart(user?.userId);
 const { data: products, isLoading: isLoadingProducts } = useProducts();
 
 const updateCartMutation = useUpdateCart();
 const removeCartItemMutation = useRemoveCartItem();

 if (!isAuthenticated || !user?.userId) {
 return (
 <div className="max-w-3xl mx-auto py-16 px-4">
 <EmptyState 
 icon={ShoppingBag}
 title="Sign in to view your cart"
 description="You need to be logged in to access your shopping cart."
 action={
 <Link to="/login" className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-primary text-bg-primary font-medium hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
 Sign In
 </Link>
 }
 />
 </div>
 );
 }

 if (isLoadingCart || isLoadingProducts) {
 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pb-8 pb-32 space-y-8">
 <Skeleton className="h-10 w-48 mb-8" />
 <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-start relative">
 <div className="lg:col-span-2 space-y-4 md:space-y-6">
 {[1, 2, 3].map(i => (
 <div key={i} className="flex gap-4 md:gap-6 bg-bg-card dark:bg-bg-card p-4 md:p-6 rounded-3xl shadow-sm border border-border-subtle dark:border-border-subtle">
 <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shrink-0" />
 <div className="flex flex-col flex-1">
 <Skeleton className="h-6 w-3/4 mb-2" />
 <Skeleton className="h-6 w-24 mb-4" />
 <div className="mt-auto flex justify-between">
 <Skeleton className="h-10 w-24 rounded-lg" />
 <Skeleton className="h-10 w-10 rounded-lg" />
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="bg-bg-card dark:bg-bg-card p-4 md:p-6 rounded-3xl border border-border-subtle dark:border-border-subtle">
 <Skeleton className="h-8 w-40 mb-6" />
 <div className="space-y-4 mb-6">
 <Skeleton className="h-4 w-full" />
 <Skeleton className="h-4 w-full" />
 <Skeleton className="h-4 w-full" />
 </div>
 <Skeleton className="h-6 w-full mb-6" />
 <Skeleton className="h-14 w-full rounded-xl" />
 </div>
 </div>
 </div>
 );
 }

 if (isErrorCart) {
 return (
 <div className="max-w-3xl mx-auto py-16 px-4 text-center">
 <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
 <h2 className="text-xl font-bold text-text-primary mb-2">Error loading cart</h2>
 <p className="text-text-secondary dark:text-text-secondary">Please try refreshing the page.</p>
 </div>
 );
 }

 const items = cartItems || [];

 if (items.length === 0) {
 return (
 <div className="max-w-3xl mx-auto py-16 px-4">
 <EmptyState 
 icon={ShoppingBag}
 title="Your cart is empty"
 description="Looks like you haven't added any items to your cart yet."
 action={
 <Link to="/products" className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-primary text-bg-primary font-medium hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
 Continue Shopping
 </Link>
 }
 />
 </div>
 );
 }

 // Join Cart with Product data and filter out missing products
 const enrichedCart = items.map(item => {
 const product = products?.find(p => p.id === item.product_id);
 return {
 ...item,
 product,
 available: 99
 };
 }).filter(item => item.product); // only show items where product still exists

 const totalPrice = enrichedCart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
 const tax = totalPrice * 0.08;
 const total = totalPrice + tax;

 const handleUpdateQuantity = (productId: string, quantity: number) => {
 updateCartMutation.mutate({
 user_id: user.userId,
 product_id: productId,
 quantity
 });
 };

 const handleRemove = (productId: string) => {
 removeCartItemMutation.mutate({
 userId: user.userId,
 productId
 });
 };

 return (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pb-8 pb-32"
 >
 <h1 className="text-4xl font-playfair font-bold text-text-primary mb-8">Shopping Cart</h1>
 
 <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-start relative">
 {/* Cart Items */}
 <div className="lg:col-span-2 space-y-4 md:space-y-6">
 {enrichedCart.map((item) => {
 const product = item.product!;
 return (
 <div key={item.product_id} className="flex gap-4 md:gap-6 bg-bg-card dark:bg-bg-card p-4 md:p-6 rounded-[32px] shadow-soft border border-border-subtle dark:border-border-subtle transition-all hover:shadow-[0_8px_30px_rgba(21,216,255,0.08)] hover:border-primary/30">
 <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-bg-secondary dark:bg-bg-primary rounded-2xl overflow-hidden">
 <Link to={`/product/${product.id}`} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-xl block h-full w-full">
 <img 
 src={product.image_url || 'https://via.placeholder.com/400'} 
 alt={product.name}
 className="w-full h-full object-cover object-center"
 />
 </Link>
 </div>
 
 <div className="flex flex-col flex-1 min-w-0">
 <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-4">
 <div className="min-w-0">
 <h3 className="font-playfair font-semibold text-lg text-text-primary line-clamp-2 mb-1">
 <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors focus:outline-none">
 {product.name}
 </Link>
 </h3>
 {item.available < item.quantity && (
 <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
 <AlertCircle className="h-3 w-3" /> Only {item.available} available
 </p>
 )}
 </div>
 <PriceTag price={product.price} size="md" className="shrink-0" />
 </div>
 
 <div className="mt-auto pt-4 flex items-center justify-between">
 <QuantitySelector 
 quantity={item.quantity} 
 onChange={(q) => handleUpdateQuantity(product.id, q)} 
 maxQuantity={item.available > 0 ? item.available : 99}
 />
 <button 
 onClick={() => handleRemove(product.id)}
 disabled={removeCartItemMutation.isPending}
 aria-label="Remove item"
 className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
 >
 <Trash2 className="h-5 w-5" />
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* Order Summary */}
 <div className="lg:sticky lg:top-24 h-fit bg-bg-card dark:bg-bg-card p-6 md:p-8 rounded-[32px] shadow-soft border border-border-subtle dark:border-border-subtle">
 <h2 className="text-xl font-playfair font-bold text-text-primary mb-6">Order Summary</h2>
 
 <div className="space-y-4 text-sm mb-6">
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
 
 <div className="border-t border-border-subtle dark:border-border-subtle pt-4 mb-8">
 <div className="flex justify-between items-center mb-1">
 <span className="font-playfair font-bold text-lg text-text-primary">Total</span>
 <span className="text-xl md:text-2xl font-bold text-text-primary">{formatCurrency(total)}</span>
 </div>
 </div>
 
 <Link 
 to="/checkout"
 className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-bg-primary rounded-xl font-space font-bold uppercase tracking-wider hover:bg-primary-hover hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-[0_4px_20px_rgba(21,216,255,0.3)]"
 >
 Checkout
 <ArrowRight className="h-5 w-5" />
 </Link>
 </div>
 </div>
 </motion.div>
 );
}
