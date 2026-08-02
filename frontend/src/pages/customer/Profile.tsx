import { motion } from 'framer-motion';
import { User, Heart, Settings, LogOut, Package, ChevronRight, Edit2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { formatCurrency } from '../../utils/currency';
import { safeFormatDate } from '../../utils/date';
import { shortOrderId } from './Orders';

export default function Profile() {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const { data: orders, isLoading: isLoadingOrders, isError: isErrorOrders } = useOrders(user?.userId);

 const initials = user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U';

 const handleLogout = async () => {
 await logout();
 navigate('/login');
 };

 const recentOrders = orders ? orders.slice(0, 3) : [];

 return (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
 >
 <div className="grid md:grid-cols-3 gap-8">
 
 {/* Sidebar */}
 <div className="space-y-6">
 <div className="bg-bg-card dark:bg-bg-card p-6 rounded-[32px] shadow-soft border border-border-subtle dark:border-border-subtle text-center relative">
 <button className="absolute top-4 right-4 p-2 text-text-secondary hover:text-primary transition-colors">
 <Edit2 className="h-4 w-4" />
 </button>
 <div className="w-24 h-24 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold mb-4">
 {initials}
 </div>
 <h2 className="text-xl font-bold text-text-primary">{user?.displayName}</h2>
 <p className="text-text-secondary dark:text-text-secondary text-sm">{user?.email || user?.username}</p>
 </div>

 <div className="bg-bg-card dark:bg-bg-card rounded-[32px] shadow-soft border border-border-subtle dark:border-border-subtle overflow-hidden">
 <div className="p-2">
 <Link to="/account" className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 text-primary font-medium">
 <User className="h-5 w-5" />
 Profile Overview
 </Link>
 <Link to="/orders" className="flex items-center gap-3 p-3 rounded-2xl text-text-secondary hover:bg-bg-secondary dark:hover:bg-bg-secondary hover:text-text-primary transition-colors">
 <Package className="h-5 w-5" />
 My Orders
 </Link>
 <Link to="/wishlist" className="flex items-center gap-3 p-3 rounded-2xl text-text-secondary hover:bg-bg-secondary dark:hover:bg-bg-secondary hover:text-text-primary transition-colors">
 <Heart className="h-5 w-5" />
 Wishlist
 </Link>
 <Link to="/settings" className="flex items-center gap-3 p-3 rounded-2xl text-text-secondary hover:bg-bg-secondary dark:hover:bg-bg-secondary hover:text-text-primary transition-colors">
 <Settings className="h-5 w-5" />
 Settings
 </Link>
 </div>
 <div className="p-2 border-t border-border-subtle dark:border-border-subtle">
 <button 
 onClick={handleLogout}
 className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
 >
 <LogOut className="h-5 w-5" />
 Log out
 </button>
 </div>
 </div>
 </div>

 <div className="md:col-span-2 space-y-8">
 
 {/* Recent Orders */}
 <div className="bg-bg-card dark:bg-bg-card rounded-[32px] p-8 shadow-soft border border-border-subtle dark:border-border-subtle">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
 <Package className="h-6 w-6 text-primary" />
 Recent Orders
 </h3>
 <Link to="/orders" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
 View all
 </Link>
 </div>
 
 <div className="space-y-4">
 {isLoadingOrders ? (
 <>
 <Skeleton className="h-20 w-full rounded-2xl" />
 <Skeleton className="h-20 w-full rounded-2xl" />
 <Skeleton className="h-20 w-full rounded-2xl" />
 </>
 ) : isErrorOrders ? (
 <div className="py-8 text-center border border-dashed border-red-200 dark:border-red-900/50 rounded-2xl bg-red-50/50 dark:bg-red-900/10">
 <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
 <p className="text-text-secondary dark:text-text-secondary">Failed to load recent orders.</p>
 </div>
 ) : recentOrders.length === 0 ? (
 <div className="py-8 border border-dashed border-border-subtle dark:border-border-subtle rounded-2xl">
 <EmptyState 
 icon={Package}
 title="No recent orders"
 description="You haven't placed any orders yet."
 action={
 <Link to="/products" className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors">
 Start Shopping
 </Link>
 }
 />
 </div>
 ) : (
 recentOrders.map(order => (
 <div 
 key={order.order_id} 
 className="flex items-center justify-between p-4 rounded-2xl border border-border-subtle dark:border-border-subtle hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(21,216,255,0.08)] transition-all cursor-pointer"
 onClick={() => navigate('/orders')}
 >
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center text-primary">
 <Package className="h-6 w-6" />
 </div>
 <div>
 <h4 className="font-semibold text-text-primary mb-1">Order {shortOrderId(order.order_id)}</h4>
 <p className="text-sm text-text-secondary dark:text-text-secondary">{safeFormatDate(order.created_at, { year: 'numeric', month: 'numeric', day: 'numeric'})}</p>
 </div>
 </div>
 <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-2/3">
 <span className="font-medium text-text-primary">{formatCurrency(order.total_amount)}</span>
 <div className="flex flex-col gap-1 items-end">
 <StatusBadge status={order.order_status} />
 <span className="text-xs text-text-secondary dark:text-text-secondary">Pay: {order.payment_status}</span>
 </div>
 <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors hidden sm:block" />
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 <div className="grid sm:grid-cols-2 gap-6">
 <Link to="/wishlist" className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-gray-800 dark:to-gray-800 p-6 rounded-3xl border border-pink-200 dark:border-border-subtle hover:shadow-md transition-all group">
 <Heart className="h-8 w-8 text-pink-500 mb-4 group-hover:scale-110 transition-transform" fill="currentColor" />
 <h3 className="text-lg font-bold text-text-primary mb-1">My Wishlist</h3>
 <p className="text-sm text-text-secondary">View saved items</p>
 </Link>
 
 <Link to="/settings" className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800 p-6 rounded-3xl border border-border-subtle dark:border-border-subtle hover:shadow-md transition-all group">
 <Settings className="h-8 w-8 text-text-secondary dark:text-text-secondary mb-4 group-hover:rotate-45 transition-transform duration-300" />
 <h3 className="text-lg font-bold text-text-primary mb-1">Account Settings</h3>
 <p className="text-sm text-text-secondary">Manage your password & details</p>
 </Link>
 </div>
 </div>
 
 </div>
 </motion.div>
 );
}
