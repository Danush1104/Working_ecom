import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Sun,
  Moon,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { Suspense } from 'react';
import { Skeleton } from '../components/ui/Skeleton';

const AdminSkeleton = () => (
  <div className="space-y-6 w-full">
    <Skeleton className="h-10 w-48 mb-8" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
    <Skeleton className="h-96 w-full" />
  </div>
);

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  
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
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Package },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
    { name: 'Carts', href: '/admin/carts', icon: ShoppingCart },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Payments', href: '/admin/payments', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      <ScrollToTop />
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Link to="/admin" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
            ADMIN PANEL
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                  isActive 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white dark:text-white dark:hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500 dark:text-gray-400'}`} />
                {item.name}
                {isActive && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200 sticky top-0 z-40">
          <button 
            aria-label="Open Menu"
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
            <button 
              aria-label="Toggle Theme"
              onClick={toggleTheme} 
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-full transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <div className="relative" ref={notifRef}>
              <button 
                aria-label="Notifications"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dark:text-white dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
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
                      <h3 className="font-semibold text-gray-900 dark:text-white">Admin Alerts</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-4 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative" ref={profileRef}>
              <button 
                aria-label="Profile Menu"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  A
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 w-full p-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                      <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 w-full p-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <Settings className="h-4 w-4" /> Preferences
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
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Suspense fallback={<AdminSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex md:hidden"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" 
              onClick={() => setIsSidebarOpen(false)} 
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative flex w-full max-w-xs flex-col bg-white dark:bg-gray-900 h-full"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">ADMIN</span>
                <button 
                  aria-label="Close Menu"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 -mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary ${
                      location.pathname === item.href 
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white dark:text-white dark:hover:text-white'
                    }`}
                  >
                    <item.icon className={`h-6 w-6 ${location.pathname === item.href ? 'text-primary' : 'text-gray-400 dark:text-gray-500 dark:text-gray-400'}`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
