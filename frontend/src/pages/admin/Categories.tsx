import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, X, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import { DataTable } from '../../components/admin/DataTable';
import { ViewModal } from '../../components/ui/ViewModal';
import { FilterBar } from '../../components/admin/FilterBar';
import { FilterDrawer } from '../../components/admin/FilterDrawer';
import { AdminRefreshButton } from '../../components/ui/AdminRefreshButton';
import { Pagination } from '../../components/ui/Pagination';
import type { Category } from '../../api/productService';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  icon_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  banner_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function Categories() {
  const { data: categories = [], isLoading, refetch } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('a-z');
  const pageSize = 10;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema)
  });

  const safeCategories = Array.isArray(categories) ? categories : [];
  
  const processedCategories = safeCategories.filter(category => 
    (category.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    if (sortOrder === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    if (sortOrder === 'z-a') return (b.name || '').localeCompare(a.name || '');
    return (a.name || '').localeCompare(b.name || ''); // a-z default
  });

  const totalPages = Math.max(1, Math.ceil(processedCategories.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCategories = processedCategories.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({ name: category.name, description: category.description, icon_url: category.icon_url || '', banner_url: category.banner_url || '' });
    } else {
      setEditingCategory(null);
      reset({ name: '', description: '', icon_url: '', banner_url: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = (data: CategoryForm) => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, data }, {
        onSuccess: () => closeModal()
      });
    } else {
      createCategory.mutate(data, {
        onSuccess: () => closeModal()
      });
    }
  };

  const handleDelete = (category: Category) => {
    if (window.confirm(`Are you sure you want to delete ${category.name}?`)) {
      deleteCategory.mutate(category.id);
    }
  };

  const columns = [
    { 
      header: 'Icon', 
      accessor: (item: Category) => item.icon_url ? (
        <img src={item.icon_url} alt={item.name} className="w-10 h-10 rounded-full object-cover bg-gray-100 dark:bg-gray-800" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-bold">
          {item.name.charAt(0).toUpperCase()}
        </div>
      )
    },
    { header: 'Name', accessor: (item: Category) => <span className="font-medium text-gray-900 dark:text-white">{item.name}</span> },
    { header: 'Description', accessor: (item: Category) => item.description || '-' },
    { header: 'Created', accessor: (item: Category) => new Date(item.created_at || new Date().toISOString()).toLocaleDateString() },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (item: Category) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              setViewingCategory(item);
              setIsViewModalOpen(true);
            }}
            className="p-2 text-gray-400 hover:text-primary transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openModal(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage product categories</p>
        </div>
        <AdminRefreshButton onRefresh={refetch} isRefetching={false} />
      </div>

      <FilterBar 
        placeholder="Search categories..."
        onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        onFilterClick={() => setIsFilterOpen(true)}
        onAdd={() => openModal()}
        addLabel="Add Category"
      />

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onReset={() => setSortOrder('a-z')}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 outline-none focus:ring-1 focus:ring-primary dark:text-white"
          >
            <option value="a-z">Name (A-Z)</option>
            <option value="z-a">Name (Z-A)</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </FilterDrawer>

      <DataTable 
        columns={columns}
        data={paginatedCategories}
        keyExtractor={(item) => item.id}
      />

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <Pagination 
            currentPage={safeCurrentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-card/90 backdrop-blur-2xl border border-border-subtle rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                <h2 className="text-xl font-space font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={closeModal} className="text-text-secondary hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input 
                    {...register('name')}
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea 
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon URL
                  </label>
                  <input 
                    {...register('icon_url')}
                    type="url"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                    placeholder="https://..."
                  />
                  {errors.icon_url && <p className="mt-1 text-sm text-red-500">{errors.icon_url.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Banner URL
                  </label>
                  <input 
                    {...register('banner_url')}
                    type="url"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                    placeholder="https://..."
                  />
                  {errors.banner_url && <p className="mt-1 text-sm text-red-500">{errors.banner_url.message}</p>}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCategory.isPending || updateCategory.isPending}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors disabled:opacity-50"
                  >
                    {createCategory.isPending || updateCategory.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Category Details"
        fields={viewingCategory ? [
          { label: 'Category ID', value: viewingCategory.id },
          { label: 'Name', value: viewingCategory.name },
          { label: 'Description', value: viewingCategory.description, fullWidth: true },
          { label: 'Created At', value: new Date(viewingCategory.created_at || '').toLocaleString() }
        ] : []}
      />
    </div>
  );
}
