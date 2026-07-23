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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="bg-white dark:bg-bg-card w-full max-w-5xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-border-subtle flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 sm:px-8 border-b border-gray-100 dark:border-border-subtle">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-playfair">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {fields.map((field, idx) => (
                  <div key={idx} className={`${field.fullWidth ? 'md:col-span-2' : ''}`}>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      {field.label}
                    </h4>
                    <div className="text-gray-900 dark:text-gray-100 text-lg break-words font-medium">
                      {field.value ?? <span className="text-gray-400 italic font-normal">Not provided</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 sm:px-8 border-t border-gray-100 dark:border-border-subtle bg-gray-50 dark:bg-bg-secondary/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
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
