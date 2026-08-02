import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../api/productService';
import toast from 'react-hot-toast';

export const useCategories = () => {
 return useQuery({
 queryKey: ['categories'],
 queryFn: categoryService.getCategories,
 });
};

export const useCreateCategory = () => {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: categoryService.createCategory,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['categories'] });
 toast.success('Category created successfully');
 },
 onError: (error: any) => {
 toast.error(error?.response?.data?.message || 'Failed to create category');
 }
 });
};

export const useUpdateCategory = () => {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) => 
 categoryService.updateCategory(id, data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['categories'] });
 toast.success('Category updated successfully');
 },
 onError: (error: any) => {
 toast.error(error?.response?.data?.message || 'Failed to update category');
 }
 });
};

export const useDeleteCategory = () => {
 const queryClient = useQueryClient();
 
 return useMutation({
 mutationFn: categoryService.deleteCategory,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['categories'] });
 toast.success('Category deleted successfully');
 },
 onError: (error: any) => {
 toast.error(error?.response?.data?.message || 'Failed to delete category');
 }
 });
};
