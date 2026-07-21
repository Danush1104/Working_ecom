import { apiClient } from './client';

export interface Inventory {
  product_id: string;
  stock: number;
  reserved: number;
  available: number;
  last_updated?: string;
}

const INVENTORY_API_URL = import.meta.env.VITE_INVENTORY_SERVICE_URL;

export const inventoryService = {
  getInventory: async (): Promise<Inventory[]> => {
    const response = await apiClient.get(INVENTORY_API_URL);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.data && Array.isArray(response.data.inventory)) return response.data.inventory;
    if (response.data && Array.isArray(response.data.Items)) return response.data.Items;
    throw new Error('Invalid response format: expected an array of inventory items');
  },

  getProductInventory: async (productId: string): Promise<Inventory> => {
    const response = await apiClient.get(`${INVENTORY_API_URL}/${productId}`);
    if (response.data && response.data.Item) return response.data.Item;
    if (response.data && response.data.data) return response.data.data;
    return response.data;
  },

  createInventory: async (data: { product_id: string; stock: number }): Promise<Inventory> => {
    const response = await apiClient.post(INVENTORY_API_URL, data);
    return response.data;
  },

  updateStock: async (productId: string, data: { stock: number }): Promise<Inventory> => {
    const response = await apiClient.patch(`${INVENTORY_API_URL}/${productId}/stock`, data);
    return response.data;
  }
};
