import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuantitySelector } from '../../components/ui/QuantitySelector';
import { PriceTag } from '../../components/ui/PriceTag';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useCart, useUpdateCart, useRemoveCartItem } from '../../hooks/useCart';
import { useProducts } from '../../hooks/useProducts';
import { useInventory } from '../../hooks/useInventory';
import { Skeleton } from '../../components/ui/Skeleton';

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  
  const { data: cartItems, isLoading: isLoadingCart, isError: isErrorCart } = useCart(user?.userId);
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const { data: inventory } = useInventory();
  
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
            <Link to="/login" className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-primary text-white font-medium hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
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
              <div key={i} className="flex gap-4 md:gap-6 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
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
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-3xl border border-gray-200 dark:border-gray-700">
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error loading cart</h2>
        <p className="text-gray-500 dark:text-gray-400">Please try refreshing the page.</p>
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
            <Link to="/products" className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-primary text-white font-medium hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
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
    const inv = inventory?.find(i => i.product_id === item.product_id);
    return {
      ...item,
      product,
      available: inv?.available ?? 0
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-start relative">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {enrichedCart.map((item) => {
            const product = item.product!;
            return (
              <div key={item.product_id} className="flex gap-4 md:gap-6 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden">
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
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                        <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors focus:outline-none focus:underline">
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
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
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
        <div className="bg-white dark:bg-gray-800/90 backdrop-blur-md p-4 md:p-6 rounded-t-3xl md:rounded-3xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] md:shadow-soft border border-gray-200 dark:border-gray-700 fixed bottom-[64px] left-0 right-0 md:sticky md:top-24 md:bottom-auto z-40 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col">
            <h2 className="hidden md:block text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
            
            <div className="hidden md:block space-y-4 text-sm mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-gray-200">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Estimated Tax (8%)</span>
                <span className="font-medium text-gray-900 dark:text-gray-200">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className="font-medium text-green-600 dark:text-green-400">Free</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4 md:mb-6">
              <div className="flex justify-between items-end">
                <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
              </div>
            </div>
            
            <Link 
              to="/checkout"
              className="w-full flex items-center justify-center gap-2 h-12 md:h-14 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Checkout
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
