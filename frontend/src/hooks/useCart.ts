import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService, type CartItem } from '../api/cartService';
import toast from 'react-hot-toast';

export const useCart = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['cart', userId],
    queryFn: () => cartService.getCart(userId!),
    enabled: !!userId,
  });
};

export const useAdminCarts = () => {
  return useQuery({
    queryKey: ['adminCarts'],
    queryFn: cartService.getAllCarts,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cartService.addToCart,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['cart', newItem.user_id] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart', newItem.user_id]);

      queryClient.setQueryData<CartItem[]>(['cart', newItem.user_id], (old) => {
        if (!old) return [{ ...newItem, added_at: new Date().toISOString() }];
        
        const existing = old.find(item => item.product_id === newItem.product_id);
        if (existing) {
          return old.map(item => 
            item.product_id === newItem.product_id 
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        }
        return [...old, { ...newItem, added_at: new Date().toISOString() }];
      });

      return { previousCart };
    },
    onError: (err: any, newItem, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', newItem.user_id], context.previousCart);
      }
      toast.error(err?.response?.data?.message || 'Failed to add item to cart');
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart', variables.user_id] });
    },
    onSuccess: () => {
      toast.success('Added to cart');
    }
  });
};

export const useUpdateCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cartService.updateCart,
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: ['cart', updatedItem.user_id] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart', updatedItem.user_id]);

      queryClient.setQueryData<CartItem[]>(['cart', updatedItem.user_id], (old) => {
        if (!old) return old;
        return old.map(item => 
          item.product_id === updatedItem.product_id 
            ? { ...item, quantity: updatedItem.quantity }
            : item
        );
      });

      return { previousCart };
    },
    onError: (err: any, updatedItem, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', updatedItem.user_id], context.previousCart);
      }
      toast.error(err?.response?.data?.message || 'Failed to update quantity');
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart', variables.user_id] });
    }
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, productId }: { userId: string; productId: string }) => 
      cartService.removeCartItem(userId, productId),
    onMutate: async ({ userId, productId }) => {
      await queryClient.cancelQueries({ queryKey: ['cart', userId] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart', userId]);

      queryClient.setQueryData<CartItem[]>(['cart', userId], (old) => {
        if (!old) return old;
        return old.filter(item => item.product_id !== productId);
      });

      return { previousCart };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', variables.userId], context.previousCart);
      }
      toast.error(err?.response?.data?.message || 'Failed to remove item');
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart', variables.userId] });
    }
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cartService.clearCart,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['cart', userId] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart', userId]);

      queryClient.setQueryData<CartItem[]>(['cart', userId], () => []);

      return { previousCart };
    },
    onError: (err: any, userId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', userId], context.previousCart);
      }
      toast.error(err?.response?.data?.message || 'Failed to clear cart');
    },
    onSettled: (_, __, userId) => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
    onSuccess: () => {
      toast.success('Cart cleared');
    }
  });
};
