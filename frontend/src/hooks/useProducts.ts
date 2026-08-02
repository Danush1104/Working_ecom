import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../api/productService';
import type { Product } from '../api/productService';
import toast from 'react-hot-toast';

export const useProducts = (includeInactive: boolean = false) => {
 return useQuery({
 queryKey: ['products', { includeInactive }],
 queryFn: () => productService.getProducts(includeInactive),
 });
};

export const useProduct = (id: string) => {
 return useQuery({
 queryKey: ['product', id],
 queryFn: () => productService.getProductById(id),
 enabled: !!id,
 });
};

export const useSearchProducts = (query: string, includeInactive: boolean = false) => {
 return useQuery({
 queryKey: ['products', 'search', query, { includeInactive }],
 queryFn: () => productService.searchProducts(query, includeInactive),
 enabled: !!query && query.length > 2,
 });
};

export const useCreateProduct = () => {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: productService.createProduct,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['products'] });
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
 onSuccess: (_, variables) => {
 queryClient.invalidateQueries({ queryKey: ['products'] });
 queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
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
 onSuccess: (_, variables) => {
 queryClient.invalidateQueries({ queryKey: ['products'] });
 queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
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
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['products'] });
 toast.success('Product deleted successfully');
 },
 onError: (error: any) => {
 toast.error(error?.response?.data?.message || 'Failed to delete product');
 }
 });
};
