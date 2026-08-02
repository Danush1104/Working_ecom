import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Home, Grid, Heart, Bell, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { Suspense } from 'react';
import { Skeleton } from '../components/ui/Skeleton';

const PageSkeleton = () => (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
 <Skeleton className="h-48 w-full !rounded-3xl" />
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <Skeleton className="h-64 w-full" />
 <Skeleton className="h-64 w-full" />
 <Skeleton className="h-64 w-full" />
 <Skeleton className="h-64 w-full" />
 </div>
 </div>
);

export default function CustomerLayout() {
 const { isDarkMode, toggleTheme } = useTheme();
 const { logout, user } = useAuth();
 const navigate = useNavigate();
 
 const { data: cart } = useCart(user?.userId);
 const totalItems = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
 
 const { totalItems: wishlistCount } = useWishlist();
 
 const [isProfileOpen, setIsProfileOpen] = useState(false);
 const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
 
 const profileRef = useRef<HTMLDivElement>(null);
 const notifRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
 setIsProfileOpen(false);
 }
 if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
 setIsNotificationsOpen(false);
 }
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 useEffect(() => {
 const handleEsc = (e: KeyboardEvent) => {
 if (e.key === 'Escape') {
 setIsProfileOpen(false);
 setIsNotificationsOpen(false);
 }
 };
 window.addEventListener('keydown', handleEsc);
 return () => window.removeEventListener('keydown', handleEsc);
 }, []);

 return (
 <div className="min-h-screen bg-bg-secondary dark:bg-bg-primary flex flex-col transition-colors duration-200 overflow-x-hidden w-full max-w-full min-w-0">
 <ScrollToTop />
 {/* Desktop Navbar */}
 <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-bg-primary shadow-sm transition-colors duration-300">
 <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
 {/* Left: Logo & Nav */}
 <div className="flex items-center gap-8 w-1/4 min-w-max">
 <Link to="/" className="text-2xl font-playfair font-bold tracking-tight text-text-primary focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg">
 STOREFRONT
 </Link>
 <nav className="hidden lg:flex items-center gap-6">
 <Link to="/products" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1">
 Categories <ChevronDown className="w-4 h-4" />
 </Link>
 <Link to="/products?category=new" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1">
 New Arrivals
 </Link>
 </nav>
 </div>
 
 {/* Center: Large Search Bar */}
 <div className="hidden md:flex flex-1 justify-center max-w-xl w-1/2">
 <div className="relative w-full group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-cyan-500 transition-colors" />
 <input 
 id="input_eyrm" 
 type="text" 
 placeholder="Search for products, categories..."
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 const val = e.currentTarget.value.trim();
 if (val) {
 navigate(`/products?q=${encodeURIComponent(val)}`);
 } else {
 navigate('/products');
 }
 }
 }}
 className="h-12 w-full rounded-full border border-border-subtle bg-bg-secondary pl-12 pr-4 text-sm text-text-primary outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-text-secondary shadow-sm"
 />
 </div>
 </div>
 
 {/* Right: Actions */}
 <div className="flex items-center justify-end gap-1 sm:gap-2 w-1/4 min-w-max">
 <Link to="/products" aria-label="Search" className="md:hidden p-2 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
 <Search className="h-5 w-5" />
 </Link>
 
 <button 
 aria-label="Toggle Theme"
 onClick={toggleTheme} 
 className="p-2 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-full transition-colors"
 >
 {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
 </button>

 <div className="relative" ref={notifRef}>
 <button 
 aria-label="Notifications"
 onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
 className="p-2 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
 >
 <Bell className="h-5 w-5" />
 </button>
 
 <AnimatePresence>
 {isNotificationsOpen && (
 <motion.div 
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.15 }}
 className="absolute right-0 mt-2 w-80 bg-bg-card dark:bg-bg-card rounded-2xl shadow-lg border border-border-subtle dark:border-border-subtle overflow-hidden z-50"
 >
 <div className="p-4 border-b border-border-subtle dark:border-border-subtle flex justify-between items-center">
 <h3 className="font-semibold text-text-primary">Notifications</h3>
 </div>
 <div className="max-h-64 overflow-y-auto p-4 text-center">
 <p className="text-sm text-text-secondary dark:text-text-secondary">No notifications yet.</p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 
 <div className="relative hidden md:block" ref={profileRef}>
 <button 
 aria-label="Profile Menu"
 onClick={() => setIsProfileOpen(!isProfileOpen)}
 className="p-2 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
 >
 <User className="h-5 w-5" />
 </button>

 <AnimatePresence>
 {isProfileOpen && (
 <motion.div 
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.15 }}
 className="absolute right-0 mt-2 w-[180px] bg-bg-card rounded-xl shadow-xl border border-border-subtle overflow-hidden z-50 p-2"
 >
 <div className="px-3 py-2 border-b border-border-subtle mb-1">
 <p className="text-xs text-text-secondary mb-0.5">
 Welcome 👋
 </p>
 <p className="text-sm font-medium text-text-primary truncate">
 {user?.displayName}
 </p>
 </div>
 <Link 
 to="/account" 
 onClick={() => setIsProfileOpen(false)}
 className="flex items-center gap-2 w-full p-2 text-sm text-text-primary hover:bg-bg-secondary rounded-lg transition-colors mb-1"
 >
 <User className="h-4 w-4 text-text-secondary" /> Profile
 </Link>
 <button 
 onClick={() => { setIsProfileOpen(false); logout(); }} 
 className="flex items-center gap-2 w-full p-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
 >
 <LogOut className="h-4 w-4" /> Log out
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 <Link to="/wishlist" aria-label="Wishlist" className="relative p-2 text-text-secondary hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-primary rounded-full transition-colors group">
 <Heart className={`h-5 w-5 transition-all duration-300 group-hover:scale-110 ${wishlistCount > 0 ? 'fill-red-500 text-red-500 group-hover:fill-red-500': 'group-hover:fill-current'}`} />
 {wishlistCount > 0 && (
 <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
 {wishlistCount > 99 ? '99+': wishlistCount}
 </span>
 )}
 </Link>

 <Link to="/cart" aria-label="Shopping Cart" className="relative p-2 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-full group">
 <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
 {totalItems > 0 && (
 <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">
 {totalItems > 99 ? '99+': totalItems}
 </span>
 )}
 </Link>
 </div>
 </div>
 </header>

 {/* Main Content */}
 <main className="flex-1 pb-16 md:pb-0">
 <Suspense fallback={<PageSkeleton />}>
 <Outlet />
 </Suspense>
 </main>

 {/* Mobile Bottom Navigation */}
 <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t border-border-subtle dark:border-border-subtle bg-bg-card dark:bg-bg-primary/90 backdrop-blur-md pb-safe">
 <div className="flex h-16 items-center justify-around px-2">
 <Link to="/" className="flex flex-col items-center gap-1 p-2 w-16 text-text-secondary dark:text-text-secondary hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
 <Home className="h-5 w-5" />
 <span className="text-[10px] font-medium">Home</span>
 </Link>
 <Link to="/products" className="flex flex-col items-center gap-1 p-2 w-16 text-text-secondary dark:text-text-secondary hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
 <Grid className="h-5 w-5" />
 <span className="text-[10px] font-medium">Shop</span>
 </Link>
 <Link to="/wishlist" className="flex flex-col items-center gap-1 p-2 w-16 text-text-secondary dark:text-text-secondary hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
 <Heart className="h-5 w-5" />
 <span className="text-[10px] font-medium">Wishlist</span>
 </Link>
 <Link to="/account" className="flex flex-col items-center gap-1 p-2 w-16 text-text-secondary dark:text-text-secondary hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
 <User className="h-5 w-5" />
 <span className="text-[10px] font-medium">Account</span>
 </Link>
 </div>
 </div>
 </div>
 );
}
