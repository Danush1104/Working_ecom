import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCategories } from '../../hooks/useCategories';

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  image_url: string;
  is_active: boolean;
  is_featured?: boolean;
  images?: string[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
  initialData?: ProductFormData | null;
  title?: string;
}

export function ProductModal({ isOpen, onClose, onSave, initialData, title = "Add Product" }: ProductModalProps) {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];
  
  const defaultCategory = categories.length > 0 ? categories[0].name : '';
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    image_url: '',
    is_active: true,
    is_featured: false,
    images: [],
  });
  const [additionalImage1, setAdditionalImage1] = useState('');
  const [additionalImage2, setAdditionalImage2] = useState('');
  const [additionalImage3, setAdditionalImage3] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        is_featured: initialData.is_featured ?? false,
        images: initialData.images || [],
      });
      const images = initialData.images || [];
      setAdditionalImage1(images[0] || '');
      setAdditionalImage2(images[1] || '');
      setAdditionalImage3(images[2] || '');
    } else {
      setFormData({
        name: '',
        description: '',
        category: defaultCategory,
        price: '',
        image_url: '',
        is_active: true,
        is_featured: false,
        images: [],
      });
      setAdditionalImage1('');
      setAdditionalImage2('');
      setAdditionalImage3('');
    }
  }, [initialData, isOpen, defaultCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process additional images
    const images = [additionalImage1, additionalImage2, additionalImage3]
      .map(url => url.trim())
      .filter(url => url.length > 0);
    // Remove duplicates
    const uniqueImages = [...new Set(images)];

    onSave({ ...formData, images: uniqueImages });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-bg-card/90 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border-subtle overflow-hidden flex flex-col max-h-full"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-border-subtle">
              <h2 className="text-2xl font-space font-bold text-white tracking-tight">{title}</h2>
              <button 
                onClick={onClose}
                className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-primary/50 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner placeholder-text-secondary/50"
                      placeholder="Product name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                    <textarea 
                      required
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full p-4 rounded-xl border border-border-subtle bg-bg-primary/50 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none shadow-inner placeholder-text-secondary/50"
                      placeholder="Product description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-primary/50 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner"
                      >
                        {(Array.isArray(categories) ? categories : []).map(c => (
                          <option key={c.id} value={c.name} className="bg-bg-card">{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                          className="w-full h-11 pl-8 pr-4 rounded-xl border border-border-subtle bg-bg-primary/50 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner placeholder-text-secondary/50"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Primary Image URL</label>
                    <input 
                      required
                      type="url" 
                      value={formData.image_url}
                      onChange={e => setFormData({...formData, image_url: e.target.value})}
                      className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-primary/50 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner placeholder-text-secondary/50"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">Additional Images (Optional)</label>
                    <div className="space-y-3">
                      <input 
                        type="url" 
                        value={additionalImage1}
                        onChange={e => setAdditionalImage1(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-primary/50 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner placeholder-text-secondary/50 text-sm"
                        placeholder="Additional Image 1 (URL)"
                      />
                      <input 
                        type="url" 
                        value={additionalImage2}
                        onChange={e => setAdditionalImage2(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-primary/50 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner placeholder-text-secondary/50 text-sm"
                        placeholder="Additional Image 2 (URL)"
                      />
                      <input 
                        type="url" 
                        value={additionalImage3}
                        onChange={e => setAdditionalImage3(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-primary/50 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner placeholder-text-secondary/50 text-sm"
                        placeholder="Additional Image 3 (URL)"
                      />
                    </div>
                    <p className="mt-2 text-xs text-text-secondary/70">Add up to 3 optional images for the product gallery.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-border-subtle">
                      <div>
                        <h4 className="text-sm font-medium text-white">Active Status</h4>
                        <p className="text-xs text-text-secondary mt-0.5">Visible to customers</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={formData.is_active}
                          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-border-subtle">
                      <div>
                        <h4 className="text-sm font-medium text-white">Featured</h4>
                        <p className="text-xs text-text-secondary mt-0.5">Show on homepage</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-border-subtle bg-black/20 flex justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 h-11 rounded-xl font-medium text-text-secondary bg-white/5 border border-border-subtle hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="px-6 h-11 rounded-xl font-bold bg-primary text-bg-primary hover:bg-primary-hover hover:shadow-[0_0_15px_rgba(21,216,255,0.4)] transition-all focus:outline-none"
                >
                  Save Product
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
