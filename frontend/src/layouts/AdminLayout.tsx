import { useState, useRef, useEffect, Suspense } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
 LayoutDashboard, 
 Package, 
 ShoppingCart, 
 Users, 
 LogOut,
 Menu,
 X,
 Bell,
 Search,
 MessageSquare,
 ChevronLeft,
 ChevronRight,
 Boxes,
 Sun,
 Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { Skeleton } from '../components/ui/Skeleton';

const AdminSkeleton = () => (
 <div className="space-y-6 w-full p-8">
 <Skeleton className="h-10 w-48 mb-8 bg-border-subtle" />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <Skeleton className="h-32 w-full bg-border-subtle" />
 <Skeleton className="h-32 w-full bg-border-subtle" />
 <Skeleton className="h-32 w-full bg-border-subtle" />
 <Skeleton className="h-32 w-full bg-border-subtle" />
 </div>
 <Skeleton className="h-96 w-full bg-border-subtle" />
 </div>
);

export default function AdminLayout() {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
 const location = useLocation();
 const { user, logout } = useAuth();
 const { theme, toggleTheme } = useTheme();
 
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
 { name: 'Categories', href: '/admin/categories', icon: Boxes },
 { name: 'Inventory', href: '/admin/inventory', icon: Package },
 { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
 { name: 'Payments', href: '/admin/payments', icon: Users },
 { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
 ];

 const currentPage = navigation.find(n => n.href === location.pathname)?.name || 'Dashboard';
 const username = user?.username || 'Admin';
 const initial = username.charAt(0).toUpperCase();

 return (
 <div className="h-screen w-full bg-bg-primary text-text-primary flex selection:bg-primary/30 font-sans overflow-hidden">
 <ScrollToTop />
 
 {/* Desktop Sidebar */}
 <motion.aside 
 initial={false}
 animate={{ width: isSidebarCollapsed ? 80 : 256 }}
 className="hidden md:flex flex-col bg-bg-card/60 backdrop-blur-xl border-r border-border-subtle relative z-20"
 >
 <button 
 onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
 className="absolute -right-3 top-20 bg-bg-card border border-border-subtle rounded-full p-1 text-text-secondary hover:text-text-primary hover:border-primary/50 transition-colors z-30 shadow-soft"
 >
 {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
 </button>

 <div className="h-20 flex items-center justify-center px-4 border-b border-border-subtle">
 <Link to="/admin" className="flex items-center gap-3 group focus:outline-none">
 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(21,216,255,0.4)] group-hover:shadow-[0_0_25px_rgba(21,216,255,0.6)] transition-shadow">
 <Boxes className="h-5 w-5 text-text-primary" />
 </div>
 {!isSidebarCollapsed && (
 <span className="text-xl font-space font-bold tracking-tight text-text-primary group-hover:text-primary transition-colors">
 STOREFRONT
 </span>
 )}
 </Link>
 </div>

 <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 no-scrollbar">
 <div className={`text-xs font-semibold text-text-secondary/50 tracking-wider mb-4 px-3 ${isSidebarCollapsed ? 'text-center': ''}`}>
 {isSidebarCollapsed ? '---': 'MENU'}
 </div>
 {navigation.map((item) => {
 const isActive = location.pathname === item.href;
 return (
 <Link
 key={item.name}
 to={item.href}
 className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group focus:outline-none ${
 isActive 
 ? 'text-primary bg-primary/10 shadow-[inset_0_0_15px_rgba(21,216,255,0.05)]'
 : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
 }`}
 title={isSidebarCollapsed ? item.name : undefined}
 >
 {isActive && (
 <motion.div 
 layoutId="activeTab" 
 className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(21,216,255,0.8)]"
 />
 )}
 <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(21,216,255,0.5)]': 'text-text-secondary group-hover:text-text-primary'}`} />
 {!isSidebarCollapsed && (
 <span>{item.name}</span>
 )}
 {/* Tooltip for collapsed state */}
 {isSidebarCollapsed && (
 <div className="absolute left-14 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-bg-secondary text-text-primary text-xs py-1 px-2 rounded border border-border-subtle whitespace-nowrap z-50">
 {item.name}
 </div>
 )}
 </Link>
 );
 })}
 </nav>

 <div className="p-4 border-t border-border-subtle">
 <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center': ''}`}>
 <div className="h-10 w-10 rounded-full bg-bg-secondary border border-border-subtle flex items-center justify-center font-bold text-text-primary shadow-soft flex-shrink-0">
 {initial}
 </div>
 {!isSidebarCollapsed && (
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-text-primary truncate">{username}</p>
 <p className="text-xs text-text-secondary truncate">Administrator</p>
 </div>
 )}
 </div>
 </div>
 </motion.aside>

 {/* Main Content Area */}
 <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
 {/* Top Header */}
 <header className="h-20 flex items-center justify-between px-4 sm:px-8 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle sticky top-0 z-30">
 <div className="flex items-center gap-4">
 <button 
 aria-label="Open Menu"
 onClick={() => setIsSidebarOpen(true)}
 className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary focus:outline-none rounded-lg transition-colors"
 >
 <Menu className="h-6 w-6" />
 </button>
 <div className="hidden sm:block">
 <h1 className="text-xl font-space font-semibold text-text-primary tracking-tight">{currentPage}</h1>
 <div className="flex items-center text-xs text-text-secondary mt-0.5">
 <span>Admin</span>
 <ChevronRight className="h-3 w-3 mx-1 opacity-50" />
 <span className="text-primary/80">{currentPage}</span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3 sm:gap-5">
 <button 
 onClick={toggleTheme}
 className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-full transition-colors focus:outline-none"
 title={theme === 'dark'?"Switch to light mode" :"Switch to dark mode"}
 >
 <AnimatePresence mode="wait">
 <motion.div
 key={theme}
 initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
 animate={{ opacity: 1, rotate: 0, scale: 1 }}
 exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
 transition={{ duration: 0.2 }}
 >
 {theme === 'dark'? <Sun className="h-5 w-5 hover:text-primary transition-colors" /> : <Moon className="h-5 w-5 hover:text-primary transition-colors" />}
 </motion.div>
 </AnimatePresence>
 </button>

 <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-full transition-colors focus:outline-none">
 <Search className="h-5 w-5" />
 </button>
 
 <div className="relative" ref={notifRef}>
 <button 
 onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
 className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-full transition-colors focus:outline-none"
 >
 <Bell className="h-5 w-5" />
 <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(21,216,255,0.8)]"></span>
 </button>
 
 <AnimatePresence>
 {isNotificationsOpen && (
 <motion.div 
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.15 }}
 className="absolute right-0 mt-2 w-80 bg-bg-card/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-border-subtle overflow-hidden z-50"
 >
 <div className="p-4 border-b border-border-subtle flex justify-between items-center">
 <h3 className="font-semibold text-text-primary">Notifications</h3>
 <span className="text-xs text-primary cursor-pointer hover:underline">Mark all read</span>
 </div>
 <div className="max-h-64 overflow-y-auto p-4 text-center">
 <p className="text-sm text-text-secondary">System operating optimally.</p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 
 <div className="relative" ref={profileRef}>
 <button 
 onClick={() => setIsProfileOpen(!isProfileOpen)}
 className="flex items-center gap-2 p-1 rounded-full hover:bg-bg-secondary focus:outline-none transition-colors"
 >
 <div className="h-8 w-8 rounded-full bg-bg-secondary border border-border-subtle flex items-center justify-center font-bold text-sm text-text-primary hover:border-primary/50 transition-colors">
 {initial}
 </div>
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
 <p className="text-sm font-medium text-text-primary truncate">{username}</p>
 <p className="text-xs text-text-secondary">Admin</p>
 </div>
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
 </div>
 </header>

 {/* Page Content */}
 <main className="flex-1 overflow-y-auto overflow-x-hidden bg-bg-primary scroll-smooth">
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
 className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
 onClick={() => setIsSidebarOpen(false)} 
 />
 <motion.div 
 initial={{ x:"-100%" }}
 animate={{ x: 0 }}
 exit={{ x:"-100%" }}
 transition={{ type:"spring", damping: 25, stiffness: 300 }}
 className="relative flex w-full max-w-[280px] flex-col bg-bg-card h-full border-r border-border-subtle shadow-2xl"
 >
 <div className="flex h-20 items-center justify-between px-6 border-b border-border-subtle">
 <Link to="/admin" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(21,216,255,0.4)]">
 <Boxes className="h-5 w-5 text-text-primary" />
 </div>
 <span className="text-xl font-space font-bold tracking-tight text-text-primary">
 STOREFRONT
 </span>
 </Link>
 <button 
 onClick={() => setIsSidebarOpen(false)}
 className="p-2 -mr-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
 >
 <X className="h-6 w-6" />
 </button>
 </div>
 <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
 <div className="text-xs font-semibold text-text-secondary/50 tracking-wider mb-4 px-2">
 MENU
 </div>
 {navigation.map((item) => {
 const isActive = location.pathname === item.href;
 return (
 <Link
 key={item.name}
 to={item.href}
 onClick={() => setIsSidebarOpen(false)}
 className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
 isActive 
 ? 'text-primary bg-primary/10 shadow-[inset_0_0_15px_rgba(21,216,255,0.05)]'
 : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
 }`}
 >
 {isActive && (
 <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(21,216,255,0.8)]" />
 )}
 <item.icon className={`h-6 w-6 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(21,216,255,0.5)]': 'text-text-secondary'}`} />
 {item.name}
 </Link>
 );
 })}
 </nav>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
