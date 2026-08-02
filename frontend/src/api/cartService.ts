import { apiClient } from './client';

export interface CartItem {
 user_id: string;
 product_id: string;
 quantity: number;
 added_at?: string;
 updated_at?: string;
}

export interface CartPayload {
 user_id: string;
 product_id: string;
 quantity: number;
}

const CART_API_URL = import.meta.env.VITE_CART_SERVICE_URL;

export const cartService = {
 getCart: async (userId: string): Promise<CartItem[]> => {
 const response = await apiClient.get(`${CART_API_URL}/${userId}`);
 const normalize = (arr: any[]) => arr.map(item => ({
 ...item,
 user_id: item.user_id || item.userId || userId,
 product_id: item.product_id || item.productId,
 }));
 
 if (Array.isArray(response.data)) return normalize(response.data);
 if (response.data && Array.isArray(response.data.data)) return normalize(response.data.data);
 if (response.data?.data?.items && Array.isArray(response.data.data.items)) return normalize(response.data.data.items);
 if (response.data && Array.isArray(response.data.Items)) return normalize(response.data.Items);
 if (response.data && Array.isArray(response.data.items)) return normalize(response.data.items);
 
 // If it's empty or unexpected, return empty array safely instead of crashing
 return [];
 },

 addToCart: async (data: CartPayload): Promise<CartItem> => {
 const response = await apiClient.post(CART_API_URL, data);
 return response.data;
 },

 updateCart: async (data: CartPayload): Promise<CartItem> => {
 const response = await apiClient.patch(CART_API_URL, data);
 return response.data;
 },

 removeCartItem: async (userId: string, productId: string): Promise<void> => {
 await apiClient.delete(`${CART_API_URL}/${userId}/${productId}`);
 },

 clearCart: async (userId: string): Promise<void> => {
 await apiClient.delete(`${CART_API_URL}/${userId}`);
 },

 getAllCarts: async (): Promise<CartItem[]> => {
 const response = await apiClient.get(`${CART_API_URL}/all`);
 
 let allItems: CartItem[] = [];
 if (response.data?.data?.carts && Array.isArray(response.data.data.carts)) {
 response.data.data.carts.forEach((cart: any) => {
 if (Array.isArray(cart.items)) {
 const normalized = cart.items.map((item: any) => ({
 ...item,
 user_id: item.user_id || item.userId || cart.user_id,
 product_id: item.product_id || item.productId,
 }));
 allItems = allItems.concat(normalized);
 }
 });
 return allItems;
 }

 const normalize = (arr: any[]) => arr.map(item => ({
 ...item,
 user_id: item.user_id || item.userId,
 product_id: item.product_id || item.productId,
 }));
 
 if (Array.isArray(response.data)) return normalize(response.data);
 if (response.data && Array.isArray(response.data.data)) return normalize(response.data.data);
 if (response.data && Array.isArray(response.data.Items)) return normalize(response.data.Items);
 if (response.data && Array.isArray(response.data.items)) return normalize(response.data.items);
 
 return [];
 }
};
