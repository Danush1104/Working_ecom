import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteDialogProps {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: () => void;
 itemName?: string;
}

export function DeleteDialog({ isOpen, onClose, onConfirm, itemName = 'this item'}: DeleteDialogProps) {
 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 />

 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="relative w-full max-w-md bg-bg-card rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border-subtle overflow-hidden p-6 text-center"
 >
 <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
 <AlertTriangle className="h-8 w-8 text-red-600" />
 </div>
 
 <h2 className="text-xl font-bold text-text-primary font-space tracking-tight mb-2">Are you sure?</h2>
 <p className="text-text-secondary mb-8">
 Do you really want to delete <strong>{itemName}</strong>? This action cannot be undone.
 </p>

 <div className="flex gap-3 justify-center">
 <button 
 onClick={onClose}
 className="flex-1 h-12 rounded-xl font-medium text-text-secondary bg-bg-primary border border-border-subtle hover:text-text-primary transition-colors"
 >
 Cancel
 </button>
 <button 
 onClick={() => {
 onConfirm();
 onClose();
 }}
 className="flex-1 h-12 rounded-xl font-medium text-text-primary bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
 >
 Delete
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 );
}
