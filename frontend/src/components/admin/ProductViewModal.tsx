import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, Package, Tag, Hash, Sparkles } from 'lucide-react';
import type { Product } from '../../api/productService';
import { formatCurrency } from '../../utils/currency';
import { StatusBadge } from './StatusBadge';

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductViewModal({ isOpen, onClose, product }: ProductViewModalProps) {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-full"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Product Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3 flex-shrink-0">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <StatusBadge status={product.is_active ? 'Active' : 'Inactive'} />
                      {product.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {product.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> ID</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={product.id}>{product.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Category</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{product.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><Star className="h-3.5 w-3.5" /> Rating</p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{product.average_rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({product.total_reviews || 0})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Created</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(product.created_at || "").toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Updated</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(product.updated_at || "").toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
