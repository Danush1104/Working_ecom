import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../api/productService';
import type { Product } from '../api/productService';
import toast from 'react-hot-toast';

export const useProducts = (includeInactive: boolean = false) => {
  return useQuery({
    queryKey: ['products', { includeInactive }],
    queryFn: () => productService.getProducts(includeInactive),
    staleTime: includeInactive ? 0 : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSearchProducts = (query: string, includeInactive: boolean = false) => {
  return useQuery({
    queryKey: ['products', 'search', query, { includeInactive }],
    queryFn: () => productService.searchProducts(query, includeInactive),
    enabled: !!query && query.length > 2,
    staleTime: includeInactive ? 0 : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products', { includeInactive: true }] }),
        queryClient.invalidateQueries({ queryKey: ['products', { includeInactive: false }] })
      ]);
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create product');
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => 
      productService.updateProduct(id, data),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products', { includeInactive: true }] }),
        queryClient.invalidateQueries({ queryKey: ['products', { includeInactive: false }] }),
        queryClient.invalidateQueries({ queryKey: ['product', variables.id] })
      ]);
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update product');
    }
  });
};

export const usePatchProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => 
      productService.patchProduct(id, data),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products', { includeInactive: true }] }),
        queryClient.invalidateQueries({ queryKey: ['products', { includeInactive: false }] }),
        queryClient.invalidateQueries({ queryKey: ['product', variables.id] })
      ]);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update product status');
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products', { includeInactive: true }] }),
        queryClient.invalidateQueries({ queryKey: ['products', { includeInactive: false }] })
      ]);
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete product');
    }
  });
};
