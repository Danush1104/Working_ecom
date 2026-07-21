export const ADMIN_PRODUCTS = [
  { id: 'PROD-1001', name: 'Wireless Noise Cancelling Headphones', category: 'Electronics', price: 299.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', isActive: true, description: 'Premium sound experience.' },
  { id: 'PROD-1002', name: 'Minimalist Mechanical Keyboard', category: 'Accessories', price: 129.50, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212', isActive: true, description: 'Compact 75% layout.' },
  { id: 'PROD-1003', name: 'Smart Fitness Watch Series 7', category: 'Wearables', price: 399.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', isActive: false, description: 'Advanced health monitoring.' },
  { id: 'PROD-1004', name: 'Premium Leather Briefcase', category: 'Fashion', price: 189.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', isActive: true, description: 'Handcrafted full-grain leather.' },
];


export const ADMIN_ORDERS = [
  { id: '#ORD-9021', user: 'Alex Johnson', email: 'alex@example.com', amount: 299.99, status: 'Processing', date: 'Oct 24, 2023' },
  { id: '#ORD-9022', user: 'Sarah Smith', email: 'sarah.s@example.com', amount: 129.50, status: 'Shipped', date: 'Oct 23, 2023' },
  { id: '#ORD-9023', user: 'Michael Brown', email: 'mbrown@example.com', amount: 399.00, status: 'Delivered', date: 'Oct 21, 2023' },
  { id: '#ORD-9024', user: 'Emily Davis', email: 'emily.d@example.com', amount: 189.99, status: 'Cancelled', date: 'Oct 20, 2023' },
];

export const ADMIN_PAYMENTS = [
  { id: 'PAY-10042', orderId: '#ORD-9021', amount: 299.99, status: 'Succeeded', date: 'Oct 24, 2023' },
  { id: 'PAY-10041', orderId: '#ORD-9022', amount: 129.50, status: 'Succeeded', date: 'Oct 23, 2023' },
  { id: 'PAY-10040', orderId: '#ORD-9023', amount: 399.00, status: 'Succeeded', date: 'Oct 21, 2023' },
  { id: 'PAY-10039', orderId: '#ORD-9024', amount: 189.99, status: 'Refunded', date: 'Oct 20, 2023' },
];
