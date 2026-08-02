import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DetailsDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 children: React.ReactNode;
}

export function DetailsDrawer({ isOpen, onClose, title, children }: DetailsDrawerProps) {
 useEffect(() => {
 if (isOpen) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = 'unset';
 }
 return () => {
 document.body.style.overflow = 'unset';
 };
 }, [isOpen]);

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
 />
 
 {/* Drawer */}
 <motion.div
 initial={{ x: '100%'}}
 animate={{ x: 0 }}
 exit={{ x: '100%'}}
 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
 className="fixed top-0 right-0 h-full w-full max-w-md bg-bg-card dark:bg-bg-primary shadow-2xl z-50 flex flex-col border-l border-border-subtle dark:border-border-subtle"
 >
 <div className="flex items-center justify-between p-6 border-b border-border-subtle">
 <h2 className="text-xl font-semibold text-text-primary truncate pr-4">
 {title}
 </h2>
 <button
 onClick={onClose}
 className="p-2 -mr-2 text-text-secondary hover:text-text-secondary dark:hover:text-gray-300 hover:bg-bg-secondary dark:hover:bg-bg-card rounded-full transition-colors flex-shrink-0"
 >
 <X className="h-5 w-5" />
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto p-6">
 {children}
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
