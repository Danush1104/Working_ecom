import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Moon, Sun, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { fetchAuthSession } from 'aws-amplify/auth';
import { UserPlus, Loader2 } from 'lucide-react';

export default function Settings() {
 const { user } = useAuth();
 const { isDarkMode, toggleTheme } = useTheme();
 
 const [notifications, setNotifications] = useState({
 emailAlerts: true,
 orderUpdates: true,
 inventoryAlerts: false,
 });
 
 const [newAdminEmail, setNewAdminEmail] = useState('');
 const [newAdminPassword, setNewAdminPassword] = useState('');
 const [newAdminName, setNewAdminName] = useState('');
 const [isInviting, setIsInviting] = useState(false);

 const handleSave = () => {
 toast.success('Settings saved successfully');
 };

 const handleInviteAdmin = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newAdminEmail || !newAdminPassword) {
 toast.error('Email and password are required');
 return;
 }
 
 setIsInviting(true);
 try {
 const session = await fetchAuthSession();
 const token = session.tokens?.idToken?.toString();
 const baseUrl = import.meta.env.VITE_PRODUCT_SERVICE_URL?.replace('/api/products', '');
 const API_URL =`${baseUrl}/api/admin/create-admin`;
 
 const response = await fetch(API_URL, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization:`Bearer ${token}`
 },
 body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword, name: newAdminName })
 });
 const data = await response.json();
 if (!response.ok) throw new Error(data.message || 'Failed to create admin');
 
 toast.success('Admin invited successfully');
 setNewAdminEmail('');
 setNewAdminPassword('');
 setNewAdminName('');
 } catch (error: any) {
 toast.error(error.message || 'Failed to create admin');
 } finally {
 setIsInviting(false);
 }
 };

 return (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="max-w-4xl mx-auto space-y-6 pb-12"
 >
 <div>
 <h1 className="text-2xl font-bold text-text-primary">Admin Settings</h1>
 <p className="text-text-secondary dark:text-text-secondary mt-1">Manage your account preferences and system settings</p>
 </div>

 <div className="bg-bg-card/40 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border-subtle overflow-hidden">
 <div className="p-6 border-b border-border-subtle">
 <h2 className="text-xl font-space font-bold text-text-primary flex items-center gap-2 tracking-tight">
 <User className="w-5 h-5 text-primary" />
 Account Information
 </h2>
 </div>
 <div className="p-6 space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
 <input name="email_cwvk" 
 type="email"
 value={user?.email || 'admin@example.com'}
 disabled
 className="w-full px-4 py-3 bg-bg-secondary border border-border-subtle rounded-xl text-text-secondary cursor-not-allowed shadow-inner"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
 <input name="text_miac" 
 type="text"
 value="Administrator"
 disabled
 className="w-full px-4 py-3 bg-bg-secondary border border-border-subtle rounded-xl text-text-secondary cursor-not-allowed shadow-inner"
 />
 </div>
 </div>
 </div>
 </div>

 <div className="bg-bg-card/40 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border-subtle overflow-hidden">
 <div className="p-6 border-b border-border-subtle">
 <h2 className="text-xl font-space font-bold text-text-primary flex items-center gap-2 tracking-tight">
 {isDarkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
 Appearance
 </h2>
 </div>
 <div className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="font-medium text-text-primary">Dark Mode</h3>
 <p className="text-sm text-text-secondary dark:text-text-secondary">Toggle dark mode interface</p>
 </div>
 <button
 onClick={toggleTheme}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
 isDarkMode ? 'bg-primary': 'bg-bg-secondary '
 }`}
 >
 <span
 className={`inline-block h-4 w-4 transform rounded-full bg-bg-card transition-transform ${
 isDarkMode ? 'translate-x-6': 'translate-x-1'
 }`}
 />
 </button>
 </div>
 </div>
 </div>

 <div className="bg-bg-card/40 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border-subtle overflow-hidden">
 <div className="p-6 border-b border-border-subtle">
 <h2 className="text-xl font-space font-bold text-text-primary flex items-center gap-2 tracking-tight">
 <Bell className="w-5 h-5 text-primary" />
 Notifications
 </h2>
 </div>
 <div className="p-6 space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="font-medium text-text-primary">Email Alerts</h3>
 <p className="text-sm text-text-secondary dark:text-text-secondary">Receive daily summary emails</p>
 </div>
 <button
 onClick={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
 notifications.emailAlerts ? 'bg-primary': 'bg-bg-secondary '
 }`}
 >
 <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-card transition-transform ${
 notifications.emailAlerts ? 'translate-x-6': 'translate-x-1'
 }`} />
 </button>
 </div>
 
 <div className="flex items-center justify-between">
 <div>
 <h3 className="font-medium text-text-primary">Order Updates</h3>
 <p className="text-sm text-text-secondary dark:text-text-secondary">Notify on new large orders</p>
 </div>
 <button
 onClick={() => setNotifications({ ...notifications, orderUpdates: !notifications.orderUpdates })}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
 notifications.orderUpdates ? 'bg-primary': 'bg-bg-secondary '
 }`}
 >
 <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-card transition-transform ${
 notifications.orderUpdates ? 'translate-x-6': 'translate-x-1'
 }`} />
 </button>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <h3 className="font-medium text-text-primary">Inventory Alerts</h3>
 <p className="text-sm text-text-secondary dark:text-text-secondary">Notify when stock is low</p>
 </div>
 <button
 onClick={() => setNotifications({ ...notifications, inventoryAlerts: !notifications.inventoryAlerts })}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
 notifications.inventoryAlerts ? 'bg-primary': 'bg-bg-secondary '
 }`}
 >
 <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-card transition-transform ${
 notifications.inventoryAlerts ? 'translate-x-6': 'translate-x-1'
 }`} />
 </button>
 </div>
 </div>
 </div>

 {/* Admin Management Section */}
 <div className="bg-bg-card/40 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border-subtle overflow-hidden">
 <div className="p-6 border-b border-border-subtle">
 <h2 className="text-xl font-space font-bold text-text-primary flex items-center gap-2 tracking-tight">
 <UserPlus className="w-5 h-5 text-primary" />
 Admin Management
 </h2>
 <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">
 Invite a new administrator. They will have full access to the system.
 </p>
 </div>
 <div className="p-6">
 <form onSubmit={handleInviteAdmin} className="space-y-4 max-w-md">
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
 <input name="text_smhf" 
 type="text"
 value={newAdminName}
 onChange={(e) => setNewAdminName(e.target.value)}
 placeholder="Jane Doe"
 className="w-full px-4 py-3 bg-bg-primary/50 border border-border-subtle rounded-xl focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none text-text-primary shadow-inner"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Email Address <span className="text-red-500">*</span></label>
 <input name="email_nbch" 
 type="email"
 required
 value={newAdminEmail}
 onChange={(e) => setNewAdminEmail(e.target.value)}
 placeholder="admin@example.com"
 className="w-full px-4 py-3 bg-bg-primary/50 border border-border-subtle rounded-xl focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none text-text-primary shadow-inner"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Temporary Password <span className="text-red-500">*</span></label>
 <input name="password_eysh" 
 type="password"
 required
 value={newAdminPassword}
 onChange={(e) => setNewAdminPassword(e.target.value)}
 placeholder="••••••••"
 className="w-full px-4 py-3 bg-bg-primary/50 border border-border-subtle rounded-xl focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none text-text-primary shadow-inner"
 />
 </div>
 <button
 type="submit"
 disabled={isInviting}
 className="flex items-center justify-center w-full px-4 py-2.5 bg-primary text-text-primary rounded-xl hover:bg-primary-light transition-colors font-medium disabled:opacity-50"
 >
 {isInviting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Invite Admin'}
 </button>
 </form>
 </div>
 </div>

 <div className="flex justify-end pt-4">
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={handleSave}
 className="flex items-center px-6 py-3 bg-primary text-bg-primary rounded-xl hover:bg-primary-hover hover:shadow-[0_0_15px_rgba(21,216,255,0.4)] transition-all font-bold focus:outline-none"
 >
 <Save className="w-5 h-5 mr-2" />
 Save Changes
 </motion.button>
 </div>
 </motion.div>
 );
}
