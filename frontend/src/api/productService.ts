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
 average_rating?: number;
 total_reviews?: number;
 rating_distribution?: Record<string, number>;
 images?: string[];
 created_at?: string;
 updated_at?: string;
}

const PRODUCT_API_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL;

export const productService = {
 getProducts: async (includeInactive: boolean = false): Promise<Product[]> => {
 const response = await apiClient.get(PRODUCT_API_URL, {
 params: includeInactive ? { include_inactive: 'true'} : undefined
 });
 const getFallbackImage = (category: string) => {
 const map: Record<string, string> = {
 'Mobiles': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
 'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
 'PC & accessories': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop',
 'Gaming': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop',
 'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
 'Wearables': 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800&auto=format&fit=crop',
 'Cameras': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
 'Beauty products': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
 'Home Appliances': 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=800&auto=format&fit=crop',
 'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop',
 'PC': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
 'Accessories': 'https://images.unsplash.com/photo-1528319725582-ddc096101511?q=80&w=800&auto=format&fit=crop',
 };
 return map[category] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop';
 };
 const normalize = (arr: any[]) => arr.map(p => ({ ...p, id: p.id || p.product_id, image_url: p.image_url || getFallbackImage(p.category) }));
 if (Array.isArray(response.data)) return normalize(response.data);
 if (response.data && Array.isArray(response.data.data)) return normalize(response.data.data);
 if (response.data && Array.isArray(response.data.products)) return normalize(response.data.products);
 if (response.data && Array.isArray(response.data.Items)) return normalize(response.data.Items);
 throw new Error('Invalid response format: expected an array of products');
 },

 getProductById: async (id: string): Promise<Product> => {
 const response = await apiClient.get(`${PRODUCT_API_URL}/${id}`);
 const getFallbackImage = (category: string) => {
 const map: Record<string, string> = {
 'Mobiles': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
 'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
 'PC & accessories': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop',
 'Gaming': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop',
 'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
 'Wearables': 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800&auto=format&fit=crop',
 'Cameras': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
 'Beauty products': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
 'Home Appliances': 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=800&auto=format&fit=crop',
 'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop',
 'PC': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
 'Accessories': 'https://images.unsplash.com/photo-1528319725582-ddc096101511?q=80&w=800&auto=format&fit=crop',
 };
 return map[category] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop';
 };
 const normalize = (p: any) => ({ ...p, id: p.id || p.product_id, image_url: p.image_url || getFallbackImage(p.category) });
 if (response.data && response.data.Item) return normalize(response.data.Item);
 if (response.data && response.data.data) return normalize(response.data.data);
 return normalize(response.data);
 },

 searchProducts: async (query: string, includeInactive: boolean = false): Promise<Product[]> => {
 const response = await apiClient.get(`${PRODUCT_API_URL}/search`, {
 params: { q: query, ...(includeInactive && { include_inactive: 'true'}) }
 });
 const getFallbackImage = (category: string) => {
 const map: Record<string, string> = {
 'Mobiles': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
 'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
 'PC & accessories': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop',
 'Gaming': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop',
 'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
 'Wearables': 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800&auto=format&fit=crop',
 'Cameras': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
 'Beauty products': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
 'Home Appliances': 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=800&auto=format&fit=crop',
 'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop',
 'PC': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
 'Accessories': 'https://images.unsplash.com/photo-1528319725582-ddc096101511?q=80&w=800&auto=format&fit=crop',
 };
 return map[category] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop';
 };
 const normalize = (arr: any[]) => arr.map(p => ({ ...p, id: p.id || p.product_id, image_url: p.image_url || getFallbackImage(p.category) }));
 if (Array.isArray(response.data)) return normalize(response.data);
 if (response.data && Array.isArray(response.data.data)) return normalize(response.data.data);
 if (response.data && Array.isArray(response.data.products)) return normalize(response.data.products);
 if (response.data && Array.isArray(response.data.Items)) return normalize(response.data.Items);
 throw new Error('Invalid response format: expected an array of products');
 },

 createProduct: async (data: Omit<Product, 'id'| 'created_at'| 'updated_at'>): Promise<Product> => {
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
 icon_url?: string;
 banner_url?: string;
 product_count?: number;
 display_order?: number;
 featured?: boolean;
 created_at?: string;
}

const CATEGORY_API_URL = PRODUCT_API_URL.replace(/\/products\/?$/, '/categories');

export const categoryService = {
 getCategories: async (): Promise<Category[]> => {
 const response = await apiClient.get(CATEGORY_API_URL);
 const getFallbackImage = (name: string) => {
 const map: Record<string, string> = {
 'Mobiles': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
 'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
 'PC & accessories': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop',
 'Gaming': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop',
 'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
 'Wearables': 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800&auto=format&fit=crop',
 'Cameras': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
 'Beauty products': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
 'Home Appliances': 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=800&auto=format&fit=crop',
 'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop',
 'PC': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
 'Accessories': 'https://images.unsplash.com/photo-1528319725582-ddc096101511?q=80&w=800&auto=format&fit=crop',
 };
 return map[name] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop';
 };
 const normalize = (arr: any[]) => arr.map(c => ({ ...c, id: c.id || c.product_id || c.category_id, icon_url: c.icon_url || getFallbackImage(c.name) }));
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
