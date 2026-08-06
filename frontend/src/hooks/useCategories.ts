import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../api/productService';
import type { Category } from '../api/productService';
import toast from 'react-hot-toast';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' });
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
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previousCategories = queryClient.getQueryData(['categories']);

      queryClient.setQueryData(['categories'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((c: Category) => (c.id === id ? { ...c, ...data } : c));
      });

      return { previousCategories };
    },
    onError: (error: any, _, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
      toast.error(error?.response?.data?.message || 'Failed to update category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' });
    },
    onSuccess: () => {
      toast.success('Category updated successfully');
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previousCategories = queryClient.getQueryData(['categories']);

      queryClient.setQueryData(['categories'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter((c: Category) => c.id !== id);
      });

      return { previousCategories };
    },
    onError: (error: any, _, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
      toast.error(error?.response?.data?.message || 'Failed to delete category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' });
    },
    onSuccess: () => {
      toast.success('Category deleted successfully');
    }
  });
};
