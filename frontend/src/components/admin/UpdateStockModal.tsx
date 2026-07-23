import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package } from 'lucide-react';

interface UpdateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: number) => void;
  productName?: string;
  currentStock?: number;
  isLoading?: boolean;
  mode?: 'initialize' | 'update' | 'restore' | 'deduct';
}

export function UpdateStockModal({ 
  isOpen, 
  onClose, 
  onSave, 
  productName,
  currentStock = 0,
  isLoading = false,
  mode = 'update'
}: UpdateStockModalProps) {
  const [value, setValue] = useState<number>(mode === 'update' ? currentStock : 0);

  useEffect(() => {
    if (isOpen) {
      setValue(mode === 'update' ? currentStock : 0);
    }
  }, [isOpen, currentStock, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value < 0) {
      import('react-hot-toast').then(({ toast }) => toast.error('Value cannot be negative'));
      return;
    }
    onSave(value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {mode === 'initialize' ? 'Initialize Inventory' : mode === 'restore' ? 'Restore Stock' : mode === 'deduct' ? 'Deduct Stock' : 'Set Stock'}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {productName && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Product</p>
                  <p className="text-base text-gray-900 dark:text-white font-medium">{productName}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {mode === 'update' || mode === 'initialize' ? 'New Stock Level' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-gray-900 dark:text-white font-medium"
                    required
                  />
                </div>
                {mode === 'update' && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Current Stock</span>
                    <span className="font-mono text-gray-900 dark:text-white font-medium">{currentStock}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? 'Saving...' : mode === 'initialize' ? 'Initialize Stock' : 'Update Stock'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
