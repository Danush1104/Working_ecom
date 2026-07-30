import { motion } from 'framer-motion';
import { 
  Package, 
  CheckCircle, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  Activity, 
  ChevronRight,
  Star,
  Box
} from 'lucide-react';
import { MetricCard } from '../../components/admin/MetricCard';
import { useProducts } from '../../hooks/useProducts';
import { useAdminOrders } from '../../hooks/useOrders';
import { useAdminPayments } from '../../hooks/usePayments';
import { useInventory } from '../../hooks/useInventory';
import { useAllReviews } from '../../hooks/useAllReviews';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { StatusBadge } from '../../components/admin/StatusBadge';

export default function Dashboard() {
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useAdminOrders();
  const { data: payments = [] } = useAdminPayments();
  const { data: inventory = [] } = useInventory();
  const { data: reviews = [] } = useAllReviews();
  const { user } = useAuth();
  const { theme } = useTheme();

  const username = user?.username || 'Admin';

  const chartAxisColor = theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)';
  const chartGridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tooltipBgColor = theme === 'dark' ? 'rgba(21, 26, 37, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const tooltipBorderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipTextColor = theme === 'dark' ? '#fff' : '#1F2937';

  // Metrics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalCustomers = new Set(orders.map(o => (o as any).customer_username || o.user_id)).size;
  
  const successfulPayments = payments.filter(p => p.payment_status === 'SUCCESS');
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  
  const lowStockItems = inventory.filter(i => (i.available || 0) > 0 && (i.available || 0) < 10);
  const outOfStockItems = inventory.filter(i => (i.available || 0) === 0);
  const lowStockCount = lowStockItems.length + outOfStockItems.length;

  // Chart Data: Revenue Trend (Last 7 Days)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const revenueData = last7Days.map(dateStr => {
    const dayPayments = successfulPayments.filter(p => p.created_at.startsWith(dateStr));
    const dayRevenue = dayPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: dayRevenue
    };
  });

  // Chart Data: Payment Health
  const paymentHealthData = [
    { name: 'Success', value: successfulPayments.length, color: '#10B981' },
    { name: 'Pending', value: payments.filter(p => p.payment_status === 'PENDING').length, color: '#F59E0B' },
    { name: 'Failed', value: payments.filter(p => p.payment_status === 'FAILED').length, color: '#EF4444' },
    { name: 'Refunded', value: payments.filter(p => p.payment_status === 'REFUNDED').length, color: '#8B5CF6' }
  ];

  // Top Products (by rating/price roughly)
  const topProducts = [...products]
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 4);

  // Recent Orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Recent Reviews
  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  // Low Stock specific items
  const criticalStockList = [...lowStockItems, ...outOfStockItems]
    .sort((a, b) => (a.available || 0) - (b.available || 0))
    .slice(0, 4);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-space font-bold text-white tracking-tight mb-2">
          Good afternoon, {username}
        </h1>
        <p className="text-text-secondary flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Storefront operations are running smoothly. You have {totalOrders} total orders.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard 
          title="Total Revenue" 
          value={`${formatCurrency(totalRevenue)}`} 
          icon={<DollarSign className="h-5 w-5" />} 
          trend={{ value: '+12.5%', isPositive: true }}
        />
        <MetricCard 
          title="Total Orders" 
          value={totalOrders} 
          icon={<ShoppingBag className="h-5 w-5" />} 
          trend={{ value: '+8.2%', isPositive: true }}
        />
        <MetricCard 
          title="Customers" 
          value={totalCustomers} 
          icon={<CheckCircle className="h-5 w-5" />} 
        />
        <MetricCard 
          title="Active Products" 
          value={totalProducts} 
          icon={<Package className="h-5 w-5" />} 
        />
        <MetricCard 
          title="Low Stock Alerts" 
          value={lowStockCount} 
          icon={<AlertTriangle className="h-5 w-5" />} 
          trend={{ value: '-2', isPositive: true }}
        />
      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-bg-card/40 backdrop-blur-xl rounded-2xl p-6 border border-border-subtle shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
              <p className="text-sm text-text-secondary">Last 7 days</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15D8FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#15D8FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke={chartAxisColor} 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke={chartAxisColor} 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: tooltipBgColor, 
                    border: `1px solid ${tooltipBorderColor}`,
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                    color: tooltipTextColor
                  }}
                  itemStyle={{ color: '#15D8FF' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#15D8FF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  activeDot={{ r: 6, fill: '#15D8FF', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-card/40 backdrop-blur-xl rounded-2xl p-6 border border-border-subtle shadow-soft flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-1">Payment Health</h3>
          <p className="text-sm text-text-secondary mb-6">Distribution of payment statuses</p>
          
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentHealthData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke={chartAxisColor} fontSize={12} />
                <Tooltip 
                  cursor={{fill: chartGridColor}}
                  contentStyle={{ backgroundColor: tooltipBgColor, border: `1px solid ${tooltipBorderColor}`, borderRadius: '8px', color: tooltipTextColor }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {paymentHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Sections - Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Orders */}
        <div className="bg-bg-card/40 backdrop-blur-xl rounded-2xl border border-border-subtle overflow-hidden">
          <div className="p-5 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary hover:text-white flex items-center transition-colors">
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-white/5 border-b border-border-subtle text-xs uppercase text-text-secondary/80">
                <tr>
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentOrders.map(order => (
                  <tr key={order.order_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs">{order.order_id.slice(0, 13)}...</td>
                    <td className="px-5 py-3 truncate max-w-[100px]">{(order as any).customer_username || order.user_id}</td>
                    <td className="px-5 py-3 text-white font-medium">{formatCurrency(order.total_amount)}</td>
                    <td className="px-5 py-3 text-right">
                      <StatusBadge status={order.order_status} type="order" />
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-text-secondary">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Health */}
        <div className="bg-bg-card/40 backdrop-blur-xl rounded-2xl border border-border-subtle overflow-hidden">
          <div className="p-5 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Inventory Health</h3>
            <Link to="/admin/inventory" className="text-xs text-primary hover:text-white flex items-center transition-colors">
              Manage <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-white/5 border-b border-border-subtle text-xs uppercase text-text-secondary/80">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {criticalStockList.map(item => {
                  const product = products.find(p => p.id === item.product_id);
                  return (
                    <tr key={item.product_id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-bg-secondary overflow-hidden border border-border-subtle flex items-center justify-center">
                          {product?.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <Box className="h-4 w-4 text-text-secondary" />
                          )}
                        </div>
                        <span className="truncate max-w-[150px]">{product?.name || 'Unknown'}</span>
                      </td>
                      <td className="px-5 py-3 font-medium text-white">{item.available || 0}</td>
                      <td className="px-5 py-3 text-right">
                        {(item.available || 0) === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span> OUT OF STOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span> LOW STOCK
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {criticalStockList.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-text-secondary">Inventory is healthy. No low stock items.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="bg-bg-card/40 backdrop-blur-xl rounded-2xl border border-border-subtle overflow-hidden">
          <div className="p-5 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Recent Reviews</h3>
            <Link to="/admin/reviews" className="text-xs text-primary hover:text-white flex items-center transition-colors">
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {recentReviews.map(review => {
              const product = products.find(p => p.id === review.product_id);
              return (
                <div key={review.review_id} className="bg-white/5 border border-border-subtle rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-white">{(review as any).user_name || review.user_id}</p>
                      <p className="text-xs text-text-secondary truncate max-w-[200px]">on {product?.name || review.product_id}</p>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mt-1 italic truncate">&quot;{review.review}&quot;</p>
                </div>
              );
            })}
            {recentReviews.length === 0 && (
              <p className="text-sm text-text-secondary py-4 text-center">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-bg-card/40 backdrop-blur-xl rounded-2xl border border-border-subtle overflow-hidden">
          <div className="p-5 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Top Products</h3>
            <Link to="/admin/products" className="text-xs text-primary hover:text-white flex items-center transition-colors">
              Manage <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-white/5 border-b border-border-subtle text-xs uppercase text-text-secondary/80">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {topProducts.map(product => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-bg-secondary overflow-hidden border border-border-subtle">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Box className="h-4 w-4 text-text-secondary" /></div>
                        )}
                      </div>
                      <span className="truncate max-w-[150px] font-medium text-white">{product.name}</span>
                    </td>
                    <td className="px-5 py-3">{product.category || '-'}</td>
                    <td className="px-5 py-3 text-right text-white">{formatCurrency(product.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
