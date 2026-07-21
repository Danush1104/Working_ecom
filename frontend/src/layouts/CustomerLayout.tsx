import { Outlet, Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Home, Grid, Heart, Bell, Sun, Moon, Settings, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
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
  
  const { data: cart } = useCart(user?.userId);
  const totalItems = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <ScrollToTop />
      {/* Desktop Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
              STOREFRONT
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link to="/products" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white dark:text-white dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1">
                Products
              </Link>
              <Link to="/products?category=new" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white dark:text-white dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1">
                New Arrivals
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products..."
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (val) {
                    window.location.href = `/products?q=${encodeURIComponent(val)}`;
                  }
                }}
                className="h-10 w-64 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all dark:text-white placeholder:text-gray-400"
              />
            </div>
            
            <Link to="/products" aria-label="Search" className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white dark:text-white dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
              <Search className="h-5 w-5" />
            </Link>
            
            <button 
              aria-label="Toggle Theme"
              onClick={toggleTheme} 
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-full transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative" ref={notifRef}>
              <button 
                aria-label="Notifications"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white dark:text-white dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
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
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-4 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative hidden md:block" ref={profileRef}>
              <button 
                aria-label="Profile Menu"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white dark:text-white dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
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
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        Welcome, {user?.displayName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {user?.email || user?.username}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link to="/account" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 w-full p-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 w-full p-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                    </div>
                    <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={() => { setIsProfileOpen(false); logout(); }} className="flex items-center gap-2 w-full p-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                        <LogOut className="h-4 w-4" /> Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Link to="/cart" aria-label="Shopping Cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white dark:text-white dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {totalItems > 99 ? '99+' : totalItems}
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 dark:bg-gray-900/90 backdrop-blur-md pb-safe">
        <div className="flex h-16 items-center justify-around px-2">
          <Link to="/" className="flex flex-col items-center gap-1 p-2 w-16 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/products" className="flex flex-col items-center gap-1 p-2 w-16 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
            <Grid className="h-5 w-5" />
            <span className="text-[10px] font-medium">Shop</span>
          </Link>
          <Link to="/wishlist" className="flex flex-col items-center gap-1 p-2 w-16 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
            <Heart className="h-5 w-5" />
            <span className="text-[10px] font-medium">Wishlist</span>
          </Link>
          <Link to="/account" className="flex flex-col items-center gap-1 p-2 w-16 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
