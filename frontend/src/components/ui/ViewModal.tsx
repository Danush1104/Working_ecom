import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

export interface ViewModalField {
 label: string;
 value: React.ReactNode;
 fullWidth?: boolean;
}

interface ViewModalProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 fields: ViewModalField[];
}

export function ViewModal({ isOpen, onClose, title, fields }: ViewModalProps) {
 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
 className="bg-bg-card  w-full max-w-5xl max-h-[90vh] rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-border-subtle flex flex-col"
 >
 {/* Header */}
 <div className="flex items-center justify-between p-6 sm:px-8 border-b border-border-subtle">
 <h2 className="text-2xl font-bold text-text-primary font-space tracking-tight">{title}</h2>
 <button
 onClick={onClose}
 className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-full transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {fields.map((field, idx) => (
 <div key={idx} className={`${field.fullWidth ? 'md:col-span-2': ''}`}>
 <h4 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-2">
 {field.label}
 </h4>
 <div className="text-text-primary text-lg break-words font-medium">
 {field.value ?? <span className="text-text-secondary italic font-normal">Not provided</span>}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Footer */}
 <div className="p-6 sm:px-8 border-t border-border-subtle bg-bg-secondary flex justify-end shrink-0">
 <button
 onClick={onClose}
 className="px-6 py-2.5 bg-bg-primary border border-border-subtle text-text-secondary rounded-xl hover:text-text-primary font-medium transition-colors"
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
