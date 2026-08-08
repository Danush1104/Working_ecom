import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface DetailDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 fields: { label: string; value: ReactNode }[];
 children?: ReactNode;
}

export function DetailDrawer({ isOpen, onClose, title, fields, children }: DetailDrawerProps) {
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
 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
 />

 {/* Drawer */}
 <motion.div
 initial={{ x: '100%'}}
 animate={{ x: 0 }}
 exit={{ x: '100%'}}
 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
 className="fixed inset-y-0 right-0 w-full max-w-md bg-bg-card  shadow-2xl border-l border-border-subtle z-50 flex flex-col"
 >
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-6 border-b border-border-subtle">
 <h3 className="text-xl font-space font-bold text-text-primary">
 {title}
 </h3>
 <button
 onClick={onClose}
 className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-bg-secondary focus:outline-none"
 >
 <X className="h-5 w-5" />
 </button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
 <div className="space-y-6">
 {fields.map((field, idx) => (
 <div key={idx} className="flex flex-col gap-1">
 <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
 {field.label}
 </span>
 <div className="text-sm font-medium text-text-primary break-all bg-bg-secondary p-3 rounded-xl border border-border-subtle">
 {field.value}
 </div>
 </div>
 ))}
 </div>
 {children}
 </div>
 
 {/* Footer */}
 <div className="px-6 py-4 border-t border-border-subtle bg-bg-secondary flex justify-end shrink-0">
 <button
 onClick={onClose}
 className="px-6 py-2 bg-bg-primary border border-border-subtle rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary transition-all focus:outline-none"
 >
 Close
 </button>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
