import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Power, Eye } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { FilterDrawer } from '../../components/admin/FilterDrawer';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ProductModal } from '../../components/admin/ProductModal';
import type { ProductFormData } from '../../components/admin/ProductModal';
import { ViewModal } from '../../components/ui/ViewModal';
import { DeleteDialog } from '../../components/admin/DeleteDialog';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, usePatchProduct } from '../../hooks/useProducts';
import type { Product } from '../../api/productService';
import { formatCurrency } from '../../utils/currency';
import { Pagination } from '../../components/ui/Pagination';
import { exportToCSV } from '../../utils/csv';

export default function Products() {
 const { data: products, isLoading, isError, isFetching } = useProducts(true);
 const createProduct = useCreateProduct();
 const updateProduct = useUpdateProduct();
 const deleteProduct = useDeleteProduct();
 const patchProduct = usePatchProduct();

 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isViewModalOpen, setIsViewModalOpen] = useState(false);
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

 const [search, setSearch] = useState('');
 const [page, setPage] = useState(1);
 const [isFilterOpen, setIsFilterOpen] = useState(false);
 const [statusFilter, setStatusFilter] = useState('all');
 const itemsPerPage = 10;

 // Data pipeline: Filter -> Search -> Sort -> Paginate
 const processedProducts = Array.isArray(products) ? products.filter(p => {
 let match = true;
 if (search) {
 match = match && (p.name.toLowerCase().includes(search.toLowerCase()) || 
 p.category.toLowerCase().includes(search.toLowerCase()));
 }
 if (statusFilter !== 'all') {
 match = match && p.is_active === (statusFilter === 'active');
 }
 return match;
 }).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()) : [];

 const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
 const paginatedProducts = processedProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

 const handleAdd = () => {
 setSelectedProduct(null);
 setIsModalOpen(true);
 };

 const handleEdit = (product: Product) => {
 setSelectedProduct(product);
 setIsModalOpen(true);
 };

 const handleDeleteClick = (product: Product) => {
 setSelectedProduct(product);
 setIsDeleteDialogOpen(true);
 };

 const handleToggleActive = (product: Product) => {
 patchProduct.mutate({ id: product.id, data: { is_active: !product.is_active } });
 };

 const handleSave = async (data: ProductFormData) => {
    const payload = {
      ...data,
      price: Number(data.price)
    };

    try {
      if (selectedProduct) {
        await updateProduct.mutateAsync({ id: selectedProduct.id, data: payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      try {
        await deleteProduct.mutateAsync(selectedProduct.id);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

 const columns: any[] = [
 {
 header: 'Product',
 accessor: (item: Product) => (
 <div className="flex items-center gap-3">
 <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-bg-secondary dark:bg-bg-card" />
 <div className="flex flex-col min-w-0">
 <span className="font-medium text-text-primary truncate">{item.name}</span>
 <span className="text-xs text-text-secondary truncate w-24" title={item.id}>{item.id}</span>
 </div>
 </div>
 )
 },
 { header: 'Category', accessor: 'category'},
 { 
 header: 'Price', 
 accessor: (item: Product) => formatCurrency(item.price)
 },
 { 
 header: 'Status', 
 accessor: (item: Product) => <StatusBadge status={item.is_active ? 'Active': 'Inactive'} />
 },
 {
 header: 'Actions',
 className: 'text-right',
 accessor: (item: Product) => (
 <div className="flex items-center justify-end gap-2">
 <button 
 onClick={() => {
 setSelectedProduct(item);
 setIsViewModalOpen(true);
 }} 
 className="p-1.5 text-text-secondary hover:text-primary transition-colors"
 title="View Details"
 >
 <Eye className="h-4 w-4" />
 </button>
 <button 
 onClick={() => handleToggleActive(item)} 
 className={`p-1.5 transition-colors ${item.is_active ? 'text-green-500 hover:text-green-600': 'text-text-secondary hover:text-text-secondary dark:hover:text-gray-300'}`}
 title={item.is_active ? 'Deactivate': 'Activate'}
 >
 <Power className="h-4 w-4" />
 </button>
 <button onClick={() => handleEdit(item)} className="p-1.5 text-text-secondary hover:text-primary transition-colors" title="Edit">
 <Edit2 className="h-4 w-4" />
 </button>
 <button onClick={() => handleDeleteClick(item)} className="p-1.5 text-text-secondary hover:text-red-500 transition-colors" title="Delete">
 <Trash2 className="h-4 w-4" />
 </button>
 </div>
 )
 }
 ];

 return (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
 <div className="flex items-center justify-between">
 <h1 className="text-2xl font-bold text-text-primary tracking-tight">Products</h1>
 </div>

 <FilterBar 
 placeholder="Search products..." 
 onSearch={(val) => { setSearch(val); setPage(1); }}
 onFilterClick={() => setIsFilterOpen(true)}
 onAdd={handleAdd} 
 onDownload={() => exportToCSV(processedProducts, 'products.csv')}
 addLabel="Add Product" 
 />

 <FilterDrawer
 isOpen={isFilterOpen}
 onClose={() => setIsFilterOpen(false)}
 onReset={() => setStatusFilter('all')}
 >
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-full rounded-lg border border-border-subtle dark:border-border-subtle bg-bg-secondary dark:bg-bg-primary px-4 py-2 outline-none focus:ring-1 focus:ring-primary"
 >
 <option value="all">All Statuses</option>
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 </select>
 </div>
 </FilterDrawer>

 {isError ? (
 <div className="text-center py-10 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
 <p className="text-red-500 font-medium">Failed to load products. Please check the backend connection.</p>
 </div>
 ) : (
 <>
 <DataTable 
 columns={columns} 
 data={paginatedProducts} 
 keyExtractor={(item) => item.id} 
 isLoading={isLoading}
 isFetching={isFetching || updateProduct.isPending || patchProduct.isPending || deleteProduct.isPending || createProduct.isPending}
 />
 
 {totalPages > 1 && (
 <div className="mt-6 flex justify-end">
 <Pagination 
 currentPage={page} 
 totalPages={totalPages} 
 onPageChange={setPage} 
 />
 </div>
 )}
 </>
 )}

 <ProductModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onSave={handleSave}
 initialData={selectedProduct ? {
 ...selectedProduct,
 price: selectedProduct.price.toString()
 } : null}
 title={selectedProduct ? 'Edit Product': 'Add Product'}
 isLoading={createProduct.isPending || updateProduct.isPending}
 />

 <ViewModal
 isOpen={isViewModalOpen}
 onClose={() => setIsViewModalOpen(false)}
 title="Product Details"
 fields={selectedProduct ? [
 { label: 'Image', value: <img src={selectedProduct.image_url} alt="Product" className="w-32 h-32 rounded-lg object-cover" />, fullWidth: true },
 { label: 'ID', value: selectedProduct.id },
 { label: 'Name', value: selectedProduct.name },
 { label: 'Description', value: selectedProduct.description, fullWidth: true },
 { label: 'Category', value: selectedProduct.category },
 { label: 'Price', value: formatCurrency(selectedProduct.price) },
 { label: 'Status', value: selectedProduct.is_active ? 'Active': 'Inactive'},
 { label: 'Featured', value: selectedProduct.is_featured ? 'Yes': 'No'},
 { label: 'Created At', value: new Date(selectedProduct.created_at || '').toLocaleString() },
 { label: 'Updated At', value: new Date(selectedProduct.updated_at || '').toLocaleString() }
 ] : []}
 />

 <DeleteDialog
 isOpen={isDeleteDialogOpen}
 onClose={() => setIsDeleteDialogOpen(false)}
 onConfirm={confirmDelete}
 itemName={selectedProduct?.name}
 />
 </motion.div>
 );
}
