import { motion } from 'framer-motion';
import { Package, CheckCircle, ShoppingBag, DollarSign, AlertTriangle, ArrowDownCircle, Clock, Activity, Cloud, RefreshCw } from 'lucide-react';
import { MetricCard } from '../../components/admin/MetricCard';
import { useProducts } from '../../hooks/useProducts';
import { useAdminOrders } from '../../hooks/useOrders';
import { useAdminPayments } from '../../hooks/usePayments';
import { useInventory } from '../../hooks/useInventory';
import { formatCurrency } from '../../utils/currency';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

export default function Dashboard() {
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useAdminOrders();
  const { data: payments = [] } = useAdminPayments();
  const { data: inventory = [] } = useInventory();

  // Computations
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const totalOrders = orders.length;
  
  const successfulPayments = payments.filter(p => p.payment_status === 'SUCCESS');
  const refundedPayments = payments.filter(p => p.payment_status === 'REFUNDED');
  
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const refundedAmount = refundedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  
  const today = new Date().toDateString();
  const todayRevenue = successfulPayments
    .filter(p => new Date(p.created_at).toDateString() === today)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    
  const lowStockCount = inventory.filter(i => (i.available || 0) > 0 && (i.available || 0) < 10).length;
  const outOfStockCount = inventory.filter(i => (i.available || 0) === 0).length;
  const inStockCount = inventory.filter(i => (i.available || 0) >= 10).length;

  // Order Status Data
  const orderStatusCounts = orders.reduce((acc: any, order) => {
    acc[order.order_status] = (acc[order.order_status] || 0) + 1;
    return acc;
  }, {});
  const orderStatusData = Object.keys(orderStatusCounts).map(status => ({
    name: status,
    value: orderStatusCounts[status]
  }));
  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

  // Inventory Overview Data
  const inventoryData = [
    { name: 'In Stock', count: inStockCount },
    { name: 'Low Stock', count: lowStockCount },
    { name: 'Out of Stock', count: outOfStockCount },
  ];

  // Category Distribution Data
  const categoryCounts = products.reduce((acc: any, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.keys(categoryCounts).map(cat => ({
    name: cat || 'Uncategorized',
    count: categoryCounts[cat]
  })).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 categories

  // Payment Summary Data
  const paymentCounts = payments.reduce((acc: any, payment) => {
    acc[payment.payment_status] = (acc[payment.payment_status] || 0) + 1;
    return acc;
  }, {});
  const paymentData = Object.keys(paymentCounts).map(status => ({
    name: status,
    count: paymentCounts[status]
  }));

  // Build Recent Activity Feed
  const recentActivities: any[] = [];
  products.slice(0, 3).forEach(p => {
    recentActivities.push({
      id: `p-${p.id}`,
      type: 'product',
      message: `Added product "${p.name}"`,
      timestamp: new Date(p.created_at || new Date().toISOString()).getTime()
    });
  });
  inventory.filter(i => (i.last_updated)).slice(0, 3).forEach(i => {
    recentActivities.push({
      id: `i-${i.product_id}`,
      type: 'inventory',
      message: `Inventory stock updated (${i.available || 0} available)`,
      timestamp: new Date(i.last_updated || new Date().toISOString()).getTime()
    });
  });
  payments.filter(p => p.payment_status === 'REFUNDED').slice(0, 3).forEach(p => {
    recentActivities.push({
      id: `pay-${p.payment_id}`,
      type: 'payment',
      message: `Payment refunded (${formatCurrency(p.amount)})`,
      timestamp: new Date(p.created_at).getTime()
    });
  });
  orders.filter(o => o.order_status === 'CANCELLED').slice(0, 3).forEach(o => {
    recentActivities.push({
      id: `o-${o.order_id}`,
      type: 'order',
      message: `Order cancelled (${o.order_id.slice(0,13)}...)`,
      timestamp: new Date(o.updated_at || o.created_at).getTime()
    });
  });

  recentActivities.sort((a, b) => b.timestamp - a.timestamp);
  const topActivities = recentActivities.slice(0, 8);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString();
  };

  const getSystemHealthStatus = () => {
    if (outOfStockCount > 5) return { color: 'text-red-500 bg-red-50 dark:bg-red-900/20', text: 'Critical' };
    if (lowStockCount > 10) return { color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20', text: 'Warning' };
    return { color: 'text-green-500 bg-green-50 dark:bg-green-900/20', text: 'Healthy' };
  };
  const healthStatus = getSystemHealthStatus();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">Live Data</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={`${formatCurrency(totalRevenue)}`} 
          icon={<DollarSign className="h-5 w-5" />} 
        />
        <MetricCard 
          title="Today's Revenue" 
          value={`${formatCurrency(todayRevenue)}`} 
          icon={<Clock className="h-5 w-5" />} 
        />
        <MetricCard 
          title="Total Orders" 
          value={totalOrders} 
          icon={<ShoppingBag className="h-5 w-5" />} 
        />
        <MetricCard 
          title="Refunded Amount" 
          value={`${formatCurrency(refundedAmount)}`} 
          icon={<ArrowDownCircle className="h-5 w-5" />} 
        />
        <MetricCard 
          title="Total Products" 
          value={totalProducts} 
          icon={<Package className="h-5 w-5" />} 
        />
        <MetricCard 
          title="Active Products" 
          value={activeProducts} 
          icon={<CheckCircle className="h-5 w-5" />} 
        />
        <MetricCard 
          title="Low Stock Items" 
          value={lowStockCount} 
          icon={<AlertTriangle className="h-5 w-5" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Order Status Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {orderStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Overview */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inventory Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#8884d8" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Categories */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Categories</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" stroke="#8884d8" />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#8884d8" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Health
            </h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${healthStatus.color}`}>
              {healthStatus.text}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400">Products API</span>
              <span className="font-medium text-gray-900 dark:text-white">{totalProducts} active records</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400">Inventory Status</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">{lowStockCount} Low Stock Alerts</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400">Orders Processed</span>
              <span className="font-medium text-gray-900 dark:text-white">{totalOrders} total</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400">Payments Captured</span>
              <span className="font-medium text-gray-900 dark:text-white">{payments.length} transactions</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><Cloud className="h-4 w-4"/> Backend Status</span>
              <span className="font-medium text-green-500">Operational</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><RefreshCw className="h-4 w-4"/> Last Sync</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatTime(Date.now())}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-5">
            {topActivities.length > 0 ? (
              topActivities.map((activity, i) => (
                <div key={`${activity.id}-${i}`} className="flex gap-4 relative">
                  {i !== topActivities.length - 1 && (
                    <div className="absolute top-6 bottom-[-20px] left-1.5 w-[2px] bg-gray-100 dark:bg-gray-700"></div>
                  )}
                  <div className={`mt-1 flex-shrink-0 w-3.5 h-3.5 rounded-full ${
                    activity.type === 'product' ? 'bg-blue-500' :
                    activity.type === 'inventory' ? 'bg-amber-500' :
                    activity.type === 'payment' ? 'bg-red-500' : 'bg-purple-500'
                  } border-4 border-white dark:border-gray-800 shadow-sm z-10`}></div>
                  <div className="flex-1 pb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium tracking-wide">
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No recent activity detected.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
