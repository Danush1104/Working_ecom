import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Filter } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  onApply?: () => void;
  onReset?: () => void;
}

export function FilterDrawer({ isOpen, onClose, children, title = "Filters", onApply, onReset }: FilterDrawerProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-bg-card/90 backdrop-blur-2xl shadow-2xl border-l border-border-subtle rounded-l-3xl overflow-hidden">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-6 border-b border-border-subtle">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Filter className="h-5 w-5 text-primary" />
                        </div>
                        <Dialog.Title className="text-lg font-bold text-white">
                          {title}
                        </Dialog.Title>
                      </div>
                      <button
                        type="button"
                        className="rounded-full p-2 text-text-secondary hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
                        onClick={onClose}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 px-6 py-6 overflow-y-auto custom-scrollbar">
                      <div className="space-y-6 text-white">
                        {children}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border-subtle px-6 py-6 bg-black/20">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={onReset}
                          className="flex-1 px-4 py-3 text-sm font-semibold text-text-secondary bg-white/5 border border-border-subtle rounded-xl hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onApply) onApply();
                            onClose();
                          }}
                          className="flex-1 px-4 py-3 text-sm font-bold text-bg-primary bg-primary rounded-xl hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(21,216,255,0.4)] focus:outline-none"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
