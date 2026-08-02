import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { DetailDrawer } from '../../components/admin/DetailDrawer';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { UpdateStockModal } from '../../components/admin/UpdateStockModal';
import { useInventory, useCreateInventory, useUpdateStock, useRestoreStock, useDeductStock } from '../../hooks/useInventory';
import { useProducts } from '../../hooks/useProducts';
import { FilterBar } from '../../components/admin/FilterBar';
import { FilterDrawer } from '../../components/admin/FilterDrawer';
import { Pagination } from '../../components/ui/Pagination';
import { exportToCSV } from '../../utils/csv';

export default function Inventory() {
 const { data: inventoryData, isLoading: isLoadingInv, isError: isErrorInv } = useInventory();
 const { data: productsData, isLoading: isLoadingProd } = useProducts(true);
 const createInventory = useCreateInventory();
 const updateStock = useUpdateStock();
 const restoreStock = useRestoreStock();
 const deductStock = useDeductStock();

 const [search, setSearch] = useState('');
 const [page, setPage] = useState(1);
 const [isFilterOpen, setIsFilterOpen] = useState(false);
 const [stockFilter, setStockFilter] = useState('all');
 const [selectedItem, setSelectedItem] = useState<any>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [modalMode, setModalMode] = useState<'initialize'| 'update'| 'restore'| 'deduct'>('update');
 const [isViewModalOpen, setIsViewModalOpen] = useState(false);

 // Client-side join inventory with product details
 const joinedData = useMemo(() => {
 if (!Array.isArray(inventoryData) || !Array.isArray(productsData)) return [];
 
 const mapped = productsData.map(product => {
 const inv = inventoryData.find(i => i.product_id === product.id);
 return {
 id: product.id,
 product_id: product.id,
 name: product.name,
 category: product.category,
 has_inventory: !!inv,
 stock: inv ? inv.stock : 0,
 reserved: inv ? inv.reserved : 0,
 available: inv ? inv.available : 0,
 lastUpdated: inv ? (inv.last_updated || 'Just now') : 'N/A'
 };
 });

 return mapped;
 }, [inventoryData, productsData]);

 // Data pipeline: Data -> Filter/Search -> Sort -> Paginate
 const processedInventory = useMemo(() => {
 return joinedData.filter((item: any) => {
 let match = true;
 if (search) {
 match = match && (item.name.toLowerCase().includes(search.toLowerCase()) || 
 item.category.toLowerCase().includes(search.toLowerCase()) ||
 item.product_id.toLowerCase().includes(search.toLowerCase()));
 }
 
 if (stockFilter !== 'all') {
 if (!item.has_inventory) return false;
 const available = item.stock - item.reserved;
 if (stockFilter === 'in-stock') match = match && available >= 10;
 else if (stockFilter === 'low-stock') match = match && available > 0 && available < 10;
 else if (stockFilter === 'out-of-stock') match = match && available === 0;
 }
 
 return match;
 }).sort((a: any, b: any) => {
 // Sort by available stock (low stock first if has inventory)
 if (a.has_inventory && !b.has_inventory) return -1;
 if (!a.has_inventory && b.has_inventory) return 1;
 if (a.has_inventory && b.has_inventory) return (a.stock - a.reserved) - (b.stock - b.reserved);
 return 0;
 });
 }, [joinedData, search]);

 const itemsPerPage = 10;
 const totalPages = Math.ceil(processedInventory.length / itemsPerPage);
 const paginatedInventory = processedInventory.slice((page - 1) * itemsPerPage, page * itemsPerPage);

 const handleUpdateClick = (item: any, mode: 'update'| 'restore'| 'deduct') => {
 setSelectedItem(item);
 setModalMode(mode);
 setIsModalOpen(true);
 };
 
 const handleInitializeClick = (item: any) => {
 setSelectedItem(item);
 setModalMode('initialize');
 setIsModalOpen(true);
 };

 const handleSaveStock = (newStock: number) => {
 if (selectedItem) {
 if (modalMode === 'initialize') {
 createInventory.mutate(
 { product_id: selectedItem.product_id, stock: newStock },
 { onSuccess: () => setIsModalOpen(false) }
 );
 } else if (modalMode === 'update') {
 updateStock.mutate(
 { productId: selectedItem.product_id, stock: newStock },
 { onSuccess: () => setIsModalOpen(false) }
 );
 } else if (modalMode === 'restore') {
 restoreStock.mutate(
 { productId: selectedItem.product_id, quantity: newStock },
 { onSuccess: () => setIsModalOpen(false) }
 );
 } else if (modalMode === 'deduct') {
 deductStock.mutate(
 { productId: selectedItem.product_id, quantity: newStock },
 { onSuccess: () => setIsModalOpen(false) }
 );
 }
 }
 };

 const columns: any[] = [
 {
 header: 'Product',
 accessor: (item: any) => (
 <div className="flex flex-col">
 <span className="font-medium text-text-primary" title={item.name}>
 {item.name.length > 25 ?`${item.name.slice(0, 25)}...` : item.name}
 </span>
 <span className="text-xs text-text-secondary dark:text-text-secondary font-mono" title={item.product_id}>
 {item.product_id.length > 13 ?`${item.product_id.slice(0, 13)}...` : item.product_id}
 </span>
 </div>
 )
 },
 { header: 'Category', accessor: 'category'},
 { 
 header: 'Stock', 
 className: 'text-center',
 accessor: (item: any) => item.has_inventory ? <span className="font-medium">{item.stock}</span> : <span className="text-text-secondary dark:text-text-secondary font-normal">-</span>
 },
 { 
 header: 'Reserved', 
 className: 'text-center text-text-secondary dark:text-text-secondary',
 accessor: (item: any) => item.has_inventory ? item.reserved : <span className="text-text-secondary dark:text-text-secondary font-normal">-</span>
 },
 { 
 header: 'Available', 
 className: 'text-center font-bold text-text-primary',
 accessor: (item: any) => {
 if (!item.has_inventory) {
 return <span className="text-text-secondary dark:text-text-secondary font-normal text-sm">No inventory record</span>;
 }
 const available = item.stock - item.reserved;
 return (
 <div className="flex items-center justify-center gap-2">
 {available}
 {available === 0 ? (
 <StatusBadge status="Inactive" /> // Hacky way to show red badge based on our existing component
 ) : available < 10 ? (
 <StatusBadge status="Low Stock" />
 ) : null}
 </div>
 );
 }
 },
 { header: 'Last Updated', accessor: 'lastUpdated'},
 {
 header: 'Actions',
 className: 'text-right',
 accessor: (item: any) => (
 item.has_inventory ? (
 <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
 <button 
 onClick={() => handleUpdateClick(item, 'restore')}
 className="px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
 >
 Restore
 </button>
 <button 
 onClick={() => handleUpdateClick(item, 'deduct')}
 className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
 >
 Deduct
 </button>
 <button 
 onClick={() => handleUpdateClick(item, 'update')}
 className="px-3 py-1.5 text-xs font-medium bg-bg-secondary dark:bg-bg-card text-text-secondary rounded-lg hover:bg-bg-secondary transition-colors"
 >
 Set
 </button>
 </div>
 ) : (
 <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
 <button 
 onClick={() => handleInitializeClick(item)}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
 >
 <Plus className="h-3 w-3" />
 Initialize
 </button>
 </div>
 )
 )
 }
 ];

 return (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
 <div className="flex items-center justify-between">
 <h1 className="text-2xl font-bold text-text-primary tracking-tight">Inventory</h1>
 </div>

 <FilterBar 
 placeholder="Search by product name, ID or category..." 
 onSearch={(val) => { setSearch(val); setPage(1); }} 
 onFilterClick={() => setIsFilterOpen(true)}
 onDownload={() => exportToCSV(processedInventory, 'inventory.csv')}
 />

 <FilterDrawer
 isOpen={isFilterOpen}
 onClose={() => setIsFilterOpen(false)}
 onReset={() => setStockFilter('all')}
 >
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-2">Stock Level</label>
 <select
 value={stockFilter}
 onChange={(e) => setStockFilter(e.target.value)}
 className="w-full rounded-lg border border-border-subtle dark:border-border-subtle bg-bg-secondary dark:bg-bg-primary px-4 py-2 outline-none focus:ring-1 focus:ring-primary"
 >
 <option value="all">All Levels</option>
 <option value="in-stock">In Stock (10+)</option>
 <option value="low-stock">Low Stock (1-9)</option>
 <option value="out-of-stock">Out of Stock (0)</option>
 </select>
 </div>
 </FilterDrawer>

 {isLoadingInv || isLoadingProd ? (
 <div className="flex items-center justify-center py-20">
 <Loader2 className="h-8 w-8 animate-spin text-primary" />
 </div>
 ) : isErrorInv ? (
 <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
 <AlertCircle className="h-10 w-10 text-red-500" />
 <div>
 <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Failed to load inventory</h3>
 <p className="text-red-600/80 dark:text-red-400/80">There was a problem communicating with the inventory service. Please check your connection.</p>
 </div>
 </div>
 ) : (
 <>
 <DataTable 
 columns={columns} 
 data={paginatedInventory} 
 keyExtractor={(item) => item.product_id} 
 onRowClick={(item) => {
 setSelectedItem(item);
 setIsViewModalOpen(true);
 }}
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

 <UpdateStockModal 
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onSave={handleSaveStock}
 productName={selectedItem?.name}
 currentStock={selectedItem?.stock}
 isLoading={modalMode === 'initialize'? createInventory.isPending : updateStock.isPending}
 mode={modalMode}
 />

 <DetailDrawer
 isOpen={isViewModalOpen}
 onClose={() => setIsViewModalOpen(false)}
 title="Inventory Details"
 fields={selectedItem ? [
 { label: 'Product ID', value: selectedItem.product_id },
 { label: 'Product Name', value: selectedItem.name },
 { label: 'Category', value: selectedItem.category },
 { label: 'Has Inventory Record', value: selectedItem.has_inventory ? 'Yes': 'No'},
 { label: 'Total Stock', value: selectedItem.stock },
 { label: 'Reserved Stock', value: selectedItem.reserved },
 { label: 'Available Stock', value: selectedItem.available },
 { label: 'Last Updated', value: selectedItem.lastUpdated !== 'N/A'&& selectedItem.lastUpdated !== 'Just now'? new Date(selectedItem.lastUpdated).toLocaleString() : selectedItem.lastUpdated }
 ] : []}
 />
 </motion.div>
 );
}
