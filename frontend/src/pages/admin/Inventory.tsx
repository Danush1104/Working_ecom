import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Loader2, AlertCircle, Plus } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { UpdateStockModal } from '../../components/admin/UpdateStockModal';
import { useInventory, useUpdateStock, useCreateInventory } from '../../hooks/useInventory';
import { useProducts } from '../../hooks/useProducts';

export default function Inventory() {
  const { data: inventoryData, isLoading: isLoadingInv, isError: isErrorInv } = useInventory();
  const { data: productsData, isLoading: isLoadingProd } = useProducts();
  const updateStock = useUpdateStock();
  const createInventory = useCreateInventory();

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'update' | 'initialize'>('update');

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

    if (!search) return mapped;
    
    return mapped.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.product_id.toLowerCase().includes(search.toLowerCase())
    );
  }, [inventoryData, productsData, search]);

  const handleUpdateClick = (item: any) => {
      setSelectedItem(item);
      setModalMode('update');
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
      } else {
        updateStock.mutate(
          { productId: selectedItem.product_id, stock: newStock },
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
          <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{item.product_id}</span>
        </div>
      )
    },
    { header: 'Category', accessor: 'category' },
    { 
      header: 'Stock', 
      className: 'text-center',
      accessor: (item: any) => item.has_inventory ? <span className="font-medium">{item.stock}</span> : <span className="text-gray-400 dark:text-gray-500 font-normal">-</span>
    },
    { 
      header: 'Reserved', 
      className: 'text-center text-gray-500 dark:text-gray-400',
      accessor: (item: any) => item.has_inventory ? item.reserved : <span className="text-gray-400 dark:text-gray-500 font-normal">-</span>
    },
    { 
      header: 'Available', 
      className: 'text-center font-bold text-gray-900 dark:text-white',
      accessor: (item: any) => {
        if (!item.has_inventory) {
          return <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">No inventory record</span>;
        }
        return (
          <div className="flex items-center justify-center gap-2">
            {item.available}
            {item.available === 0 ? (
              <StatusBadge status="Inactive" /> // Hacky way to show red badge based on our existing component
            ) : item.available < 10 ? (
              <StatusBadge status="Low Stock" />
            ) : null}
          </div>
        );
      }
    },
    { header: 'Last Updated', accessor: 'lastUpdated' },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (item: any) => (
        item.has_inventory ? (
          <button 
            onClick={() => handleUpdateClick(item)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Update Stock
          </button>
        ) : (
          <button 
            onClick={() => handleInitializeClick(item)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Initialize
          </button>
        )
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Inventory</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <input 
          type="text" 
          placeholder="Search inventory by product name or ID..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

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
        <DataTable 
          columns={columns} 
          data={joinedData} 
          keyExtractor={(item) => item.id} 
        />
      )}

      <UpdateStockModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStock}
        productName={selectedItem?.name}
        currentStock={selectedItem?.stock}
        isLoading={modalMode === 'initialize' ? createInventory.isPending : updateStock.isPending}
        mode={modalMode}
      />
    </motion.div>
  );
}
