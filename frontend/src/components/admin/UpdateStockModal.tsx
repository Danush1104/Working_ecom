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
 mode?: 'initialize'| 'update'| 'restore'| 'deduct';
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
 const [value, setValue] = useState<number>(mode === 'update'? currentStock : 0);

 useEffect(() => {
 if (isOpen) {
 setValue(mode === 'update'? currentStock : 0);
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
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="bg-bg-card  rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-border-subtle"
 >
 <div className="flex items-center justify-between p-6 border-b border-border-subtle">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-xl">
 <Package className="h-5 w-5 text-primary" />
 </div>
 <h2 className="text-xl font-space font-bold text-text-primary tracking-tight">
 {mode === 'initialize'? 'Initialize Inventory': mode === 'restore'? 'Restore Stock': mode === 'deduct'? 'Deduct Stock': 'Set Stock'}
 </h2>
 </div>
 <button 
 onClick={onClose}
 className="p-2 text-text-secondary hover:text-text-primary bg-bg-secondary hover:text-text-primary rounded-full transition-colors focus:outline-none"
 disabled={isLoading}
 >
 <X className="h-5 w-5" />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-6">
 {productName && (
 <div>
 <p className="text-sm font-medium text-text-secondary mb-1">Product</p>
 <p className="text-base text-text-primary font-medium">{productName}</p>
 </div>
 )}

 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">
 {mode === 'update'|| mode === 'initialize'? 'New Stock Level': 'Quantity'}
 </label>
 <input
 type="number"
 min="0"
 value={value}
 onChange={(e) => setValue(Number(e.target.value))}
 className="w-full px-4 py-3 bg-bg-secondary border border-border-subtle rounded-xl focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none text-text-primary font-medium shadow-inner"
 required
 />
 </div>
 {mode === 'update'&& (
 <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl border border-border-subtle">
 <span className="text-sm text-text-secondary">Current Stock</span>
 <span className="font-mono text-text-primary font-bold">{currentStock}</span>
 </div>
 )}
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
 <button
 type="button"
 onClick={onClose}
 disabled={isLoading}
 className="px-5 py-2.5 text-sm font-medium text-text-secondary bg-bg-primary border border-border-subtle hover:text-text-primary transition-colors disabled:opacity-50 focus:outline-none"
 >
 Cancel
 </button>
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 type="submit"
 disabled={isLoading}
 className="px-5 py-2.5 text-sm font-bold text-bg-primary bg-primary hover:bg-primary-hover hover:shadow-[0_0_15px_rgba(21,216,255,0.4)] rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 focus:outline-none"
 >
 {isLoading ? 'Saving...': mode === 'initialize'? 'Initialize Stock': 'Update Stock'}
 </motion.button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 );
}
