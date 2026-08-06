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
 onSave: (data: ProductFormData) => void | Promise<void>;
 initialData?: ProductFormData | null;
 title?: string;
 isLoading?: boolean;
}

export function ProductModal({ isOpen, onClose, onSave, initialData, title ="Add Product", isLoading = false }: ProductModalProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process additional images
    const images = [additionalImage1, additionalImage2, additionalImage3]
      .map(url => url.trim())
      .filter(url => url.length > 0);
    // Remove duplicates
    const uniqueImages = [...new Set(images)];

    await onSave({ ...formData, images: uniqueImages });
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
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-bg-card rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-border-subtle"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-text-primary tracking-tight">{title}</h3>
              <button 
                onClick={onClose}
                disabled={isLoading}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Essential Details */}
                  <div className="space-y-5">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Basic Information</h4>
                    
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Product Name <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner placeholder-text-secondary/70 font-medium"
                        placeholder="e.g. MacBook Pro M3"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Category <span className="text-red-500">*</span></label>
                      <select 
                        required
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner font-medium appearance-none"
                        disabled={isLoading}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Price (₹) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">₹</span>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                          className="w-full h-11 pl-9 pr-4 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner font-mono font-medium placeholder-text-secondary/70"
                          placeholder="999.99"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Description <span className="text-red-500">*</span></label>
                      <textarea 
                        required
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner resize-none placeholder-text-secondary/70"
                        placeholder="Detailed product description..."
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Right Column - Media & Settings */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Media & Visibility</h4>
                    
                    <div className="bg-bg-secondary/50 p-5 rounded-xl border border-border-subtle">
                      <label className="block text-sm font-semibold text-text-primary mb-2">Primary Image URL <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="url" 
                        value={formData.image_url}
                        onChange={e => setFormData({...formData, image_url: e.target.value})}
                        className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner placeholder-text-secondary/70 text-sm mb-3"
                        placeholder="https://example.com/image.jpg"
                        disabled={isLoading}
                      />
                      {formData.image_url && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-border-subtle bg-bg-secondary flex items-center justify-center min-h-[120px] shadow-inner">
                          <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="max-h-[160px] object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Gallery Images</label>
                      <div className="space-y-3">
                        <input 
                          type="url" 
                          value={additionalImage1}
                          onChange={e => setAdditionalImage1(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner placeholder-text-secondary/70 text-sm"
                          placeholder="Additional Image 1 (URL)"
                          disabled={isLoading}
                        />
                        <input 
                          type="url" 
                          value={additionalImage2}
                          onChange={e => setAdditionalImage2(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner placeholder-text-secondary/70 text-sm"
                          placeholder="Additional Image 2 (URL)"
                          disabled={isLoading}
                        />
                        <input 
                          type="url" 
                          value={additionalImage3}
                          onChange={e => setAdditionalImage3(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner placeholder-text-secondary/70 text-sm"
                          placeholder="Additional Image 3 (URL)"
                          disabled={isLoading}
                        />
                      </div>
                      <p className="mt-2 text-xs text-text-secondary/70">Add up to 3 optional images for the product gallery.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl border border-border-subtle">
                        <div>
                          <h4 className="text-sm font-medium text-text-primary">Active Status</h4>
                          <p className="text-xs text-text-secondary mt-0.5">Visible to customers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={formData.is_active}
                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                            disabled={isLoading}
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-bg-card after:border-border-subtle after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl border border-border-subtle">
                        <div>
                          <h4 className="text-sm font-medium text-text-primary">Featured</h4>
                          <p className="text-xs text-text-secondary mt-0.5">Show on homepage</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                            disabled={isLoading}
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-bg-card after:border-border-subtle after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-border-subtle bg-bg-secondary flex justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 h-11 rounded-xl font-medium text-text-secondary bg-bg-primary border border-border-subtle hover:text-text-primary transition-colors focus:outline-none disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button 
                  whileHover={isLoading ? {} : { scale: 1.02 }}
                  whileTap={isLoading ? {} : { scale: 0.98 }}
                  type="submit" 
                  disabled={isLoading}
                  className="px-6 h-11 rounded-xl font-bold bg-primary text-bg-primary hover:bg-primary-hover hover:shadow-[0_0_15px_rgba(21,216,255,0.4)] transition-all focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && <div className="w-4 h-4 rounded-full border-2 border-bg-primary border-t-transparent animate-spin" />}
                  {isLoading ? 'Saving...' : 'Save Product'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
