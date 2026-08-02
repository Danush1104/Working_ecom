import { useState } from 'react';
import { ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { useAdminCarts } from '../../hooks/useCart';
import { EmptyState } from '../../components/ui/EmptyState';
import { FilterBar } from '../../components/admin/FilterBar';
import { Pagination } from '../../components/ui/Pagination';
import { DataTable } from '../../components/admin/DataTable';
import { DetailDrawer } from '../../components/admin/DetailDrawer';

export default function Carts() {
 const [search, setSearch] = useState('');
 const [page, setPage] = useState(1);
 const itemsPerPage = 10;
 const [selectedCart, setSelectedCart] = useState<any | null>(null);
 
 const { data: rawCarts, isLoading, isError } = useAdminCarts();

 if (isLoading) {
 return (
 <div className="flex h-[50vh] items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-primary" />
 </div>
 );
 }

 if (isError) {
 return (
 <div className="flex h-[50vh] flex-col items-center justify-center text-red-500">
 <AlertCircle className="mb-4 h-12 w-12" />
 <h2 className="text-xl font-bold">Failed to load carts</h2>
 </div>
 );
 }

 // Aggregate carts by user_id
 const aggregatedCarts = Object.values(
 (rawCarts || []).reduce((acc: any, item) => {
 if (!acc[item.user_id]) {
 acc[item.user_id] = {
 user_id: item.user_id,
 numProducts: 0,
 totalQuantity: 0,
 lastUpdated: item.updated_at || item.added_at || ''
 };
 }
 acc[item.user_id].numProducts += 1;
 acc[item.user_id].totalQuantity += (Number(item.quantity) || 0);
 
 const itemDate = new Date(item.updated_at || item.added_at || 0);
 const accDate = new Date(acc[item.user_id].lastUpdated || 0);
 if (itemDate > accDate) {
 acc[item.user_id].lastUpdated = item.updated_at || item.added_at;
 }
 
 return acc;
 }, {})
 ).filter((cart: any) => {
 if (!search) return true;
 return cart.user_id.toLowerCase().includes(search.toLowerCase());
 }).sort((a: any, b: any) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

 const totalPages = Math.ceil(aggregatedCarts.length / itemsPerPage);
 const paginatedCarts = aggregatedCarts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

 const columns = [
 {
 header: 'User ID',
 accessor: (item: any) => (
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-bg-secondary dark:bg-bg-card flex items-center justify-center shrink-0">
 <span className="text-xs font-medium text-text-secondary dark:text-text-secondary">
 {item.user_id.substring(0, 2).toUpperCase()}
 </span>
 </div>
 <span className="font-mono text-text-primary" title={item.user_id}>
 {item.user_id.length > 15 ?`${item.user_id.substring(0, 15)}...` : item.user_id}
 </span>
 </div>
 )
 },
 {
 header: 'Product Count',
 accessor: (item: any) => <span className="text-text-primary">{item.numProducts}</span>
 },
 {
 header: 'Total Quantity',
 accessor: (item: any) => <span className="text-text-primary">{item.totalQuantity}</span>
 },
 {
 header: 'Updated At',
 accessor: (item: any) => <span className="text-text-secondary dark:text-text-secondary">{new Date(item.lastUpdated).toLocaleDateString()}</span>
 }
 ];

 if (!aggregatedCarts.length) {
 return (
 <div className="bg-bg-card/40 backdrop-blur-xl rounded-3xl p-16 shadow-soft border border-border-subtle">
 <EmptyState
 icon={ShoppingCart}
 title="No Active Carts"
 description="There are currently no carts in the system."
 />
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold text-text-primary">Active Carts</h1>
 <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary">View currently active customer shopping carts.</p>
 </div>

 <FilterBar 
 placeholder="Search carts by User ID..." 
 onSearch={(val) => { setSearch(val); setPage(1); }} 
 />

 <DataTable 
 columns={columns} 
 data={paginatedCarts} 
 keyExtractor={(item: any) => item.user_id}
 onRowClick={(item) => setSelectedCart(item)}
 />

 {totalPages > 1 && (
 <div className="flex justify-end">
 <Pagination 
 currentPage={page} 
 totalPages={totalPages} 
 onPageChange={setPage} 
 />
 </div>
 )}

 <DetailDrawer 
 isOpen={!!selectedCart} 
 onClose={() => setSelectedCart(null)} 
 title="Cart Details"
 fields={selectedCart ? [
 { label: 'User ID', value: selectedCart.user_id },
 { label: 'Product Count', value: selectedCart.numProducts },
 { label: 'Total Quantity', value: selectedCart.totalQuantity },
 { label: 'Updated At', value: new Date(selectedCart.lastUpdated).toLocaleString() }
 ] : []}
 />
 </div>
 );
}
