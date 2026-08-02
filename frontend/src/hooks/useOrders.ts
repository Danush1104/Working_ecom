import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../api/orderService';
import type { CheckoutPayload, Order } from '../api/orderService';
import toast from 'react-hot-toast';

export const useOrders = (userId: string | undefined) => {
 return useQuery({
 queryKey: ['orders', userId],
 queryFn: () => orderService.getUserOrders(userId!),
 enabled: !!userId,
 });
};

export const useOrder = (userId: string | undefined, orderId: string | undefined) => {
 return useQuery({
 queryKey: ['order', userId, orderId],
 queryFn: () => orderService.getOrder(userId!, orderId!),
 enabled: !!userId && !!orderId,
 });
};

export const useAdminOrders = () => {
 return useQuery({
 queryKey: ['admin_orders'],
 queryFn: () => orderService.getAllOrders(),
 });
};

export const useCreateOrder = (userId: string | undefined) => {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (data: CheckoutPayload) => orderService.createOrder(data),
 onSuccess: () => {
 // Invalidate cart and orders upon successful checkout
 queryClient.invalidateQueries({ queryKey: ['cart', userId] });
 queryClient.invalidateQueries({ queryKey: ['orders', userId] });
 queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
 },
 onError: (error: any) => {
 const message = error.response?.data?.message || error.message || 'Failed to place order';
 toast.error(message);
 },
 });
};

export const useCancelOrder = (userId: string | undefined) => {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (orderId: string) => orderService.cancelOrder(userId!, orderId),
 onMutate: async (orderId) => {
 // Optimistic update
 await queryClient.cancelQueries({ queryKey: ['orders', userId] });
 const previousOrders = queryClient.getQueryData<Order[]>(['orders', userId]);

 if (previousOrders) {
 queryClient.setQueryData<Order[]>(
 ['orders', userId],
 previousOrders.map(order => 
 order.order_id === orderId 
 ? { ...order, order_status: 'CANCELLED'} 
 : order
 )
 );
 }
 return { previousOrders };
 },
 onSuccess: () => {
 toast.success('Order cancelled successfully');
 queryClient.invalidateQueries({ queryKey: ['orders', userId] });
 queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
 },
 onError: (error: any, _, context) => {
 const message = error.response?.data?.message || error.message || 'Failed to cancel order';
 toast.error(message);
 if (context?.previousOrders) {
 queryClient.setQueryData(['orders', userId], context.previousOrders);
 }
 },
 onSettled: () => {
 queryClient.invalidateQueries({ queryKey: ['orders', userId] });
 queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
 }
 });
};
