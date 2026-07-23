import { apiClient } from './client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
  is_featured?: boolean;
  rating?: number;
  reviews_count?: number;
  created_at?: string;
  updated_at?: string;
}

const PRODUCT_API_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL;

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get(PRODUCT_API_URL);
    const normalize = (arr: any[]) => arr.map(p => ({ ...p, id: p.id || p.product_id }));
    if (Array.isArray(response.data)) return normalize(response.data);
    if (response.data && Array.isArray(response.data.data)) return normalize(response.data.data);
    if (response.data && Array.isArray(response.data.products)) return normalize(response.data.products);
    if (response.data && Array.isArray(response.data.Items)) return normalize(response.data.Items);
    throw new Error('Invalid response format: expected an array of products');
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`${PRODUCT_API_URL}/${id}`);
    const normalize = (p: any) => ({ ...p, id: p.id || p.product_id });
    if (response.data && response.data.Item) return normalize(response.data.Item);
    if (response.data && response.data.data) return normalize(response.data.data);
    return normalize(response.data);
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await apiClient.get(`${PRODUCT_API_URL}/search`, {
      params: { q: query }
    });
    const normalize = (arr: any[]) => arr.map(p => ({ ...p, id: p.id || p.product_id }));
    if (Array.isArray(response.data)) return normalize(response.data);
    if (response.data && Array.isArray(response.data.data)) return normalize(response.data.data);
    if (response.data && Array.isArray(response.data.products)) return normalize(response.data.products);
    if (response.data && Array.isArray(response.data.Items)) return normalize(response.data.Items);
    throw new Error('Invalid response format: expected an array of products');
  },

  createProduct: async (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    const response = await apiClient.post(PRODUCT_API_URL, data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put(`${PRODUCT_API_URL}/${id}`, data);
    return response.data;
  },

  patchProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.patch(`${PRODUCT_API_URL}/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`${PRODUCT_API_URL}/${id}`);
  }
};

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

const CATEGORY_API_URL = PRODUCT_API_URL.replace(/\/products\/?$/, '/categories');

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get(CATEGORY_API_URL);
    const normalize = (arr: any[]) => arr.map(c => ({ ...c, id: c.id || c.product_id || c.category_id }));
    if (Array.isArray(response.data)) return normalize(response.data);
    if (response.data && Array.isArray(response.data.data)) return normalize(response.data.data);
    if (response.data && Array.isArray(response.data.Items)) return normalize(response.data.Items);
    return [];
  },

  createCategory: async (data: { name: string; description?: string }): Promise<Category> => {
    const response = await apiClient.post(CATEGORY_API_URL, data);
    return response.data.data || response.data;
  },

  updateCategory: async (id: string, data: { name?: string; description?: string }): Promise<Category> => {
    const response = await apiClient.patch(`${CATEGORY_API_URL}/${id}`, data);
    return response.data.data || response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`${CATEGORY_API_URL}/${id}`);
  }
};
