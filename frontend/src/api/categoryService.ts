import { apiClient } from './client';

export interface Category {
 category_id: string;
 name: string;
 description?: string;
 icon_url?: string;
 banner_url?: string;
 product_count: number;
 display_order: number;
 featured: boolean;
 is_active: boolean;
}

export const categoryService = {
 getCategories: async (): Promise<Category[]> => {
 const response = await apiClient.get('/categories');
 return response.data.data;
 },

 createCategory: async (data: Partial<Category>): Promise<Category> => {
 const response = await apiClient.post('/categories', data);
 return response.data.data;
 }
};
