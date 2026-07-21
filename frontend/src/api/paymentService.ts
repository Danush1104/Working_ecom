import { apiClient } from './client';

export interface Payment {
  payment_id: string;
  order_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  payment_status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentPayload {
  order_id: string;
  amount: number;
}

export interface ProcessPaymentPayload {
  payment_status: 'SUCCESS' | 'FAILED';
}

export const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'https://qj1y5ztjwb.execute-api.ap-southeast-1.amazonaws.com/inv/api/payments';

export const paymentService = {
  createPayment: async (payload: CreatePaymentPayload): Promise<Payment> => {
    const response = await apiClient.post(PAYMENT_API_URL, payload);
    return response.data.data || response.data;
  },

  processPayment: async (paymentId: string, payload: ProcessPaymentPayload): Promise<Payment> => {
    const response = await apiClient.patch(`${PAYMENT_API_URL}/${paymentId}/process`, payload);
    return response.data.data || response.data;
  },

  refundPayment: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.patch(`${PAYMENT_API_URL}/${paymentId}/refund`);
    return response.data.data || response.data;
  },

  getPayment: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.get(`${PAYMENT_API_URL}/${paymentId}`);
    return response.data.data || response.data;
  },

  getOrderPayments: async (orderId: string): Promise<Payment[]> => {
    const response = await apiClient.get(`${PAYMENT_API_URL}/order/${orderId}`);
    return response.data.data || [];
  },

  getAllPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get(`${PAYMENT_API_URL}/all`);
    return response.data.data || [];
  },
};
