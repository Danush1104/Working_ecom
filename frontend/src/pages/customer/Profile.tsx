
import { motion } from 'framer-motion';
import { User, Heart, Settings, Package, ChevronRight, CreditCard, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { useWishlist } from '../../context/WishlistContext';
import { useProducts } from '../../hooks/useProducts';
import { usePaymentsByOrder } from '../../hooks/usePayments';
import { Skeleton, ProductCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { formatCurrency } from '../../utils/currency';
import { safeFormatDate } from '../../utils/date';
import { ProductCard } from '../../components/customer/ProductCard';

export function shortOrderId(id: string): string {
  if (!id || id.length < 12) return id;
  return `${id.substring(0, 8)}…${id.slice(-4)}`;
}

// Payment Row Component
function OrderPaymentRow({ orderId, orderTotal, created_at }: { orderId: string, orderTotal: number, created_at: string }) {
  const { data: payments, isLoading } = usePaymentsByOrder(orderId);
  
  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl border border-border-subtle bg-bg-secondary/30 animate-pulse space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle/30">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    );
  }

  const latestPayment = payments && payments.length > 0 ? payments[payments.length - 1] : null;

  if (!latestPayment) {
    return (
      <div className="p-4 rounded-2xl border border-border-subtle bg-bg-card hover:bg-bg-secondary/40 transition-all space-y-3 overflow-hidden">
        {/* Top Row: Icon + Title + Status */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 bg-bg-secondary rounded-xl text-text-secondary shrink-0 border border-border-subtle">
              <CreditCard className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-text-primary truncate" title={`Order ${orderId}`}>
              Order {shortOrderId(orderId)}
            </p>
          </div>
          <div className="shrink-0">
            <StatusBadge status="PENDING" />
          </div>
        </div>

        {/* Bottom Row: Date + Amount */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle/40 text-xs">
          <span className="text-text-secondary whitespace-nowrap font-medium">
            {safeFormatDate(created_at)}
          </span>
          <span className="font-semibold text-text-primary font-mono text-right whitespace-nowrap">
            {formatCurrency(orderTotal)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl border border-border-subtle bg-bg-card hover:bg-bg-secondary/40 transition-all space-y-3 overflow-hidden">
      {/* Top Row: Icon + Payment ID + Status */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0 border border-primary/20">
            <CreditCard className="w-4 h-4" />
          </div>
          <p 
            title={latestPayment.payment_id}
            className="text-xs font-semibold font-mono text-text-primary truncate"
          >
            {shortOrderId(latestPayment.payment_id)}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={latestPayment.payment_status} />
        </div>
      </div>

      {/* Bottom Row: Date (Left) + Amount (Right) */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle/40 text-xs">
        <span className="text-text-secondary whitespace-nowrap font-medium">
          {safeFormatDate(latestPayment.updated_at || created_at)}
        </span>
        <span className="font-semibold text-text-primary font-mono text-right whitespace-nowrap">
          {formatCurrency(latestPayment.amount)}
        </span>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Orders
  const { data: orders, isLoading: isLoadingOrders } = useOrders(user?.userId);
  const sortedOrders = orders ? [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];
  const recentOrders = sortedOrders.slice(0, 5); // Limit to 5 for Payments and Recent Orders

  // Wishlist
  const { items: wishlistItems, isLoading: isWishlistLoading } = useWishlist();
  const { data: allProducts = [], isLoading: isProductsLoading } = useProducts();
  const wishlistProducts = allProducts.filter(p => wishlistItems.some(i => i.product_id === p.id));
  
  const initials = user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12"
    >
      
      {/* 1. Header / Profile Summary */}
      <div className="bg-bg-card rounded-[32px] p-8 sm:p-12 shadow-soft border border-border-subtle flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="w-32 h-32 shrink-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full p-1 relative z-10 shadow-lg">
          <div className="w-full h-full bg-bg-card rounded-full flex items-center justify-center text-4xl font-bold text-text-primary">
            {initials}
          </div>
        </div>
        <div className="text-center md:text-left relative z-10 flex-1">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-text-primary mb-2">Welcome, {user?.displayName}</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary text-sm font-medium text-text-secondary border border-border-subtle">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active Member
          </div>
        </div>
        <div className="relative z-10 shrink-0 mt-4 md:mt-0">
           <Link to="/settings" className="px-6 py-3 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary hover:bg-border-subtle transition-colors flex items-center gap-2 font-medium shadow-sm">
             <Settings className="w-5 h-5" /> Account Settings
           </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Account Info & Payments */}
        <div className="space-y-8 md:col-span-1">
          
          {/* Account Information */}
          <div className="bg-bg-card rounded-[32px] p-6 sm:p-8 shadow-soft border border-border-subtle relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-primary" /> Account Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-1">Full Name</p>
                <p className="font-semibold text-text-primary">{user?.displayName || 'Not provided'}</p>
              </div>
              <div className="w-full h-px bg-border-subtle/50" />
              <div>
                <p className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-1">Email Address</p>
                <p className="font-semibold text-text-primary break-all">{user?.email || user?.username}</p>
              </div>
              <div className="w-full h-px bg-border-subtle/50" />
              <div>
                <p className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-1">User ID</p>
                <p className="font-mono text-xs text-text-secondary break-all bg-bg-secondary p-3 rounded-xl mt-1 border border-border-subtle">
                  {user?.userId}
                </p>
              </div>
            </div>
          </div>

          {/* Payments Section */}
          <div className="bg-bg-card rounded-[32px] p-6 sm:p-8 shadow-soft border border-border-subtle relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Payment History
              </h2>
            </div>
            
            <div className="space-y-3 max-h-[460px] overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1">
              {isLoadingOrders ? (
                <>
                  <Skeleton className="h-20 w-full rounded-2xl !bg-bg-secondary" />
                  <Skeleton className="h-20 w-full rounded-2xl !bg-bg-secondary" />
                </>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-text-secondary">No recent payments found.</p>
                </div>
              ) : (
                recentOrders.map(order => (
                  <OrderPaymentRow 
                    key={`payment-${order.order_id}`} 
                    orderId={order.order_id} 
                    orderTotal={order.total_amount} 
                    created_at={order.created_at} 
                  />
                ))
              )}
            </div>
            {recentOrders.length > 0 && (
              <div className="pt-4 mt-2 border-t border-dashed border-border-subtle shrink-0">
                <Link to="/orders" className="text-sm font-medium text-primary hover:text-cyan-400 flex items-center justify-center gap-1 transition-colors w-full p-2">
                  View all orders <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Orders & Wishlist */}
        <div className="space-y-8 md:col-span-2">
          
          {/* Recent Orders */}
          <div className="bg-bg-card rounded-[32px] p-6 sm:p-8 shadow-soft border border-border-subtle flex flex-col group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Recent Orders
              </h2>
              <Link to="/orders" className="text-sm font-medium text-primary hover:text-cyan-400 flex items-center gap-1 transition-colors">
                View all history <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {isLoadingOrders ? (
                <>
                  <Skeleton className="h-24 w-full rounded-2xl !bg-bg-secondary" />
                  <Skeleton className="h-24 w-full rounded-2xl !bg-bg-secondary" />
                </>
              ) : recentOrders.length === 0 ? (
                <EmptyState 
                  icon={ShoppingBag}
                  title="No orders yet"
                  description="Start shopping to see your orders here."
                  action={
                    <Link to="/products" className="inline-flex h-10 px-6 items-center justify-center rounded-xl bg-primary text-bg-primary font-medium hover:bg-primary-hover shadow-sm transition-all">
                      Shop Now
                    </Link>
                  }
                />
              ) : (
                recentOrders.map(order => (
                  <div 
                    key={order.order_id}
                    onClick={() => navigate('/orders')}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-border-subtle hover:border-primary/30 hover:bg-bg-secondary/30 transition-all cursor-pointer group/card gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover/card:scale-110 transition-transform">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">Order {shortOrderId(order.order_id)}</h3>
                        <p className="text-sm text-text-secondary">{safeFormatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-text-primary">{formatCurrency(order.total_amount)}</p>
                        <p className="text-xs text-text-secondary mt-1">{order.items.length} items</p>
                      </div>
                      <StatusBadge status={order.order_status} />
                      <ChevronRight className="w-5 h-5 text-border-subtle group-hover/card:text-primary transition-colors hidden sm:block" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Wishlist Section */}
          <div className="bg-bg-card rounded-[32px] p-6 sm:p-8 shadow-soft border border-border-subtle group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> Wishlist
              </h2>
              {wishlistProducts.length > 0 && (
                <Link to="/wishlist" className="text-sm font-medium text-text-secondary hover:text-text-primary bg-bg-secondary px-4 py-1.5 rounded-full border border-border-subtle transition-colors flex items-center gap-2">
                  {wishlistProducts.length} items saved <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="min-h-[250px]">
              {isWishlistLoading || isProductsLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border-subtle rounded-3xl h-full flex flex-col items-center justify-center">
                  <Heart className="w-12 h-12 text-border-subtle mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-text-primary mb-1">Wishlist is empty</h3>
                  <p className="text-text-secondary mb-4 text-sm">Items you save will appear here.</p>
                  <Link to="/products" className="text-sm font-medium text-primary hover:underline">
                    Explore products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlistProducts.slice(0, 3).map(product => (
                    <ProductCard 
                      key={product.id} 
                      id={product.id as string} 
                      name={product.name}
                      price={product.price}
                      image_url={product.image_url}
                      category={product.category || "Saved Item"}
                      is_active={product.is_active !== false}
                      is_featured={product.is_featured}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {wishlistProducts.length > 3 && (
              <div className="mt-6 pt-4 border-t border-dashed border-border-subtle text-center">
                 <Link to="/wishlist" className="text-sm font-medium text-primary hover:text-cyan-400 transition-colors">
                   View {wishlistProducts.length - 3} more items
                 </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
