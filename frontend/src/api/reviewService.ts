import { apiClient } from './client';

export interface Review {
 product_id: string;
 review_id: string;
 user_id: string;
 user_name: string;
 rating: number;
 review: string;
 verified_purchase: boolean;
 status: string;
 created_at: string;
 updated_at: string;
}

export interface ReviewStats {
 total_reviews: number;
 average_rating: number;
 five_star: number;
 four_star: number;
 three_star: number;
 two_star: number;
 one_star: number;
}

// Since product service handles /products, we get base URL without /products
const BASE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL.replace(/\/products$/, '');
const REVIEWS_URL =`${BASE_URL}/reviews`;

export const getProductReviews = async (productId: string): Promise<Review[]> => {
 const res = await apiClient.get(`${REVIEWS_URL}/product/${productId}`);
 return res.data?.data || [];
};

export const addReview = async (data: { product_id: string; rating: number; review: string }): Promise<Review> => {
 const res = await apiClient.post(`${REVIEWS_URL}`, data);
 return res.data?.data;
};

export const updateReview = async (reviewId: string, data: { product_id: string; rating: number; review: string }): Promise<Review> => {
 const res = await apiClient.put(`${REVIEWS_URL}/${reviewId}`, data);
 return res.data?.data;
};

export const deleteReview = async (reviewId: string, productId: string): Promise<void> => {
 await apiClient.delete(`${REVIEWS_URL}/${reviewId}?product_id=${productId}`);
};

export const hideReview = async (reviewId: string, productId: string): Promise<void> => {
 await apiClient.patch(`${REVIEWS_URL}/${reviewId}`, { action: 'hide', product_id: productId });
};

export const getAllReviews = async (): Promise<Review[]> => {
 const res = await apiClient.get(`${REVIEWS_URL}/all`);
 return res.data?.data || [];
};

export const getReviewStatistics = async (): Promise<ReviewStats> => {
 const res = await apiClient.get(`${REVIEWS_URL}/all?statistics=true`);
 return res.data?.data;
};
