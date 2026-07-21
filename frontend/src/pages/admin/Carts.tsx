import { motion } from 'framer-motion';
import { ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { useAdminCarts } from '../../hooks/useCart';
import { EmptyState } from '../../components/ui/EmptyState';

export default function Carts() {
  const { data: rawCarts, isLoading, isError } = useAdminCarts();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-red-500">
        <AlertCircle className="mb-4 h-12 w-12" />
        <h2 className="text-xl font-bold">Failed to load carts</h2>
      </div>
    );
  }

  // Aggregate carts by user_id
  const aggregatedCarts = Object.values(
    (rawCarts || []).reduce((acc: any, item) => {
      if (!acc[item.user_id]) {
        acc[item.user_id] = {
          user_id: item.user_id,
          numProducts: 0,
          totalQuantity: 0,
          lastUpdated: item.updated_at || item.added_at || ''
        };
      }
      acc[item.user_id].numProducts += 1;
      acc[item.user_id].totalQuantity += item.quantity;
      
      const itemDate = new Date(item.updated_at || item.added_at || 0);
      const accDate = new Date(acc[item.user_id].lastUpdated || 0);
      if (itemDate > accDate) {
        acc[item.user_id].lastUpdated = item.updated_at || item.added_at;
      }
      
      return acc;
    }, {})
  ).sort((a: any, b: any) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  if (!aggregatedCarts.length) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="No Active Carts"
        description="There are currently no carts in the system."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Carts</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View currently active customer shopping carts.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">User ID</th>
                <th className="px-6 py-4 font-semibold">Number of Products</th>
                <th className="px-6 py-4 font-semibold">Total Quantity</th>
                <th className="px-6 py-4 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {aggregatedCarts.map((cart: any) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={cart.user_id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {cart.user_id}
                  </td>
                  <td className="px-6 py-4">
                    {cart.numProducts}
                  </td>
                  <td className="px-6 py-4">
                    {cart.totalQuantity}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {cart.lastUpdated ? new Date(cart.lastUpdated).toLocaleDateString() : 'N/A'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
