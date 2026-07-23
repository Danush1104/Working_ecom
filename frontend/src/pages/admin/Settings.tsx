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
      const API_URL = `${baseUrl}/api/admin/create-admin`;
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and system settings</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account Information
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input name="email_cwvk" 
                type="email"
                value={user?.email || 'admin@example.com'}
                disabled
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <input name="text_miac" 
                type="text"
                value="Administrator"
                disabled
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {isDarkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            Appearance
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode interface</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Email Alerts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive daily summary emails</p>
            </div>
            <button
              onClick={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.emailAlerts ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.emailAlerts ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Order Updates</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Notify on new large orders</p>
            </div>
            <button
              onClick={() => setNotifications({ ...notifications, orderUpdates: !notifications.orderUpdates })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.orderUpdates ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.orderUpdates ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Inventory Alerts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Notify when stock is low</p>
            </div>
            <button
              onClick={() => setNotifications({ ...notifications, inventoryAlerts: !notifications.inventoryAlerts })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.inventoryAlerts ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.inventoryAlerts ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Admin Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Invite a new administrator. They will have full access to the system.
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleInviteAdmin} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input name="text_smhf" 
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address <span className="text-red-500">*</span></label>
              <input name="email_nbch" 
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temporary Password <span className="text-red-500">*</span></label>
              <input name="password_eysh" 
                type="password"
                required
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isInviting}
              className="flex items-center justify-center w-full px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors font-medium disabled:opacity-50"
            >
              {isInviting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Invite Admin'}
            </button>
          </form>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors font-medium"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </button>
      </div>
    </motion.div>
  );
}
