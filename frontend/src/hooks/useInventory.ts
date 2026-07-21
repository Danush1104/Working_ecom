import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../api/inventoryService';
import toast from 'react-hot-toast';

export const useInventory = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getInventory,
  });
};

export const useProductInventory = (productId: string) => {
  return useQuery({
    queryKey: ['inventory', productId],
    queryFn: () => inventoryService.getProductInventory(productId),
    enabled: !!productId,
  });
};

export const useCreateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inventoryService.createInventory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.product_id] });
      toast.success('Inventory initialized successfully');
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || error?.response?.data || error?.message || 'Failed to initialize inventory';
      toast.error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
      console.error("Create inventory error:", error);
    }
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, stock }: { productId: string; stock: number }) => 
      inventoryService.updateStock(productId, { stock }),
    onMutate: async (newStockData) => {
      await queryClient.cancelQueries({ queryKey: ['inventory'] });
      await queryClient.cancelQueries({ queryKey: ['inventory', newStockData.productId] });

      const previousInventory = queryClient.getQueryData(['inventory']);
      const previousProductInventory = queryClient.getQueryData(['inventory', newStockData.productId]);

      queryClient.setQueryData(['inventory'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((item: any) => 
          item.product_id === newStockData.productId 
            ? { ...item, stock: newStockData.stock, available: newStockData.stock - (item.reserved || 0) } 
            : item
        );
      });

      queryClient.setQueryData(['inventory', newStockData.productId], (old: any) => {
        if (!old) return old;
        return { ...old, stock: newStockData.stock, available: newStockData.stock - (old.reserved || 0) };
      });

      return { previousInventory, previousProductInventory };
    },
    onError: (error: any, newStockData, context) => {
      if (context?.previousInventory) {
        queryClient.setQueryData(['inventory'], context.previousInventory);
      }
      if (context?.previousProductInventory) {
        queryClient.setQueryData(['inventory', newStockData.productId], context.previousProductInventory);
      }
      const errMsg = error?.response?.data?.message || error?.response?.data || error?.message || 'Failed to update stock';
      toast.error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
      console.error("Update stock error:", error);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      if (variables?.productId) {
        queryClient.invalidateQueries({ queryKey: ['inventory', variables.productId] });
      }
    },
    onSuccess: () => {
      toast.success('Stock updated successfully');
    }
  });
};
