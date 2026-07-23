import { apiClient } from './client';

const BASE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL.replace(/\/products$/, '');
export const WISHLIST_API_URL = `${BASE_URL}/wishlist`;

export const getWishlist = async (userId: string) => {
  const response = await apiClient.get(`${WISHLIST_API_URL}/${userId}`);
  
  if (Array.isArray(response.data)) return response.data;
  if (response.data && Array.isArray(response.data.data)) return response.data.data;
  if (response.data?.data?.items && Array.isArray(response.data.data.items)) return response.data.data.items;
  if (response.data && Array.isArray(response.data.Items)) return response.data.Items;
  if (response.data && Array.isArray(response.data.items)) return response.data.items;
  
  return [];
};

export const addToWishlist = async (productId: string) => {
  const response = await apiClient.post(WISHLIST_API_URL, { product_id: productId });
  return response.data?.data;
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  const response = await apiClient.delete(`${WISHLIST_API_URL}/${userId}/${productId}`);
  return response.data;
};
