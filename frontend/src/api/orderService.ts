import { apiClient } from './client';

export const ORDER_API_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'https://qj1y5ztjwb.execute-api.ap-southeast-1.amazonaws.com/inv/api/orders';

export interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  order_id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
}

export interface CheckoutPayload {
  payment_method: string;
  customer_email: string;
}

export const orderService = {
  createOrder: async (data: CheckoutPayload): Promise<Order> => {
    const response = await apiClient.post(ORDER_API_URL, data);
    return response.data.data;
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    const response = await apiClient.get(`${ORDER_API_URL}/${userId}`);
    // Backend returns { message: "...", data: [ ...orders ] }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  getOrder: async (userId: string, orderId: string): Promise<Order> => {
    const response = await apiClient.get(`${ORDER_API_URL}/${userId}/${orderId}`);
    return response.data.data;
  },

  cancelOrder: async (userId: string, orderId: string): Promise<Order> => {
    const response = await apiClient.patch(`${ORDER_API_URL}/${userId}/${orderId}/cancel`);
    return response.data.data;
  },

  getAllOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get(`${ORDER_API_URL}/all`);
    // Backend returns { message: "...", data: [ ...orders ] } or { data: { orders: [...] } }? 
    // Wait, let me double check what get_all_orders returns in the backend router!
    // order_service.py get_all_orders returns `[order.to_dict() for order in orders], next_key`
    // view_all_orders handler (I didn't view it explicitly, but usually handlers wrap it)
    // I will assume it returns { data: [...] } or { data: { orders: [...] } }. 
    // Wait, if limit is None, it returns `([orders...], None)`. The handler usually unpacks this.
    // Let me be defensive!
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response.data?.data?.orders && Array.isArray(response.data.data.orders)) {
      return response.data.data.orders;
    }
    return [];
  }
};
