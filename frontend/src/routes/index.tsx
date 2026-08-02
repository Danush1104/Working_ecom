import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import { AuthGuard, GuestGuard } from '../components/auth/AuthGuard';

const Home = lazy(() => import('../pages/customer/Home'));
const Products = lazy(() => import('../pages/customer/Products'));
const ProductDetails = lazy(() => import('../pages/customer/ProductDetails'));
const Cart = lazy(() => import('../pages/customer/Cart'));
const Checkout = lazy(() => import('../pages/customer/Checkout'));
const CustomerOrders = lazy(() => import('../pages/customer/Orders'));
const Wishlist = lazy(() => import('../pages/customer/Wishlist'));
const Profile = lazy(() => import('../pages/customer/Profile'));
const Payment = lazy(() => import('../pages/customer/Payment'));
const PaymentSuccess = lazy(() => import('../pages/customer/PaymentSuccess'));
const Settings = lazy(() => import('../pages/customer/Settings'));
const AllReviews = lazy(() => import('../pages/customer/AllReviews'));

const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('../pages/admin/Products'));
const Categories = lazy(() => import('../pages/admin/Categories'));
const Inventory = lazy(() => import('../pages/admin/Inventory'));
const Carts = lazy(() => import('../pages/admin/Carts'));
const Orders = lazy(() => import('../pages/admin/Orders'));
const Payments = lazy(() => import('../pages/admin/Payments'));
const Reviews = lazy(() => import('../pages/admin/Reviews'));

const Login = lazy(() => import('../pages/auth/Login'));
const Signup = lazy(() => import('../pages/auth/Signup'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));

export const router = createBrowserRouter([
 {
 path: '/',
 element: <AuthGuard />,
 children: [
 {
 path: '/',
 element: <CustomerLayout />,
 children: [
 { index: true, element: <Home /> },
 { path: 'products', element: <Products /> },
 { path: 'product/:id', element: <ProductDetails /> },
 { path: 'cart', element: <Cart /> },
 { path: 'checkout', element: <Checkout /> },
 { path: 'wishlist', element: <Wishlist /> },
 { path: 'account', element: <Profile /> },
 { path: 'orders', element: <CustomerOrders /> },
 { path: 'payment/:orderId', element: <Payment /> },
 { path: 'payment-success/:orderId/:paymentId', element: <PaymentSuccess /> },
 { path: 'settings', element: <Settings /> },
 { path: 'reviews', element: <AllReviews /> },
 ],
 },
 {
 path: '/admin',
 element: <AuthGuard requireAdmin={true} />,
 children: [
 {
 path: '/admin',
 element: <AdminLayout />,
 children: [
 { index: true, element: <Dashboard /> },
 { path: 'products', element: <AdminProducts /> },
 { path: 'categories', element: <Categories /> },
 { path: 'inventory', element: <Inventory /> },
 { path: 'carts', element: <Carts /> },
 { path: 'orders', element: <Orders /> },
 { path: 'payments', element: <Payments /> },
 { path: 'reviews', element: <Reviews /> },
 { path: 'dashboard', element: <Dashboard /> },
 ],
 },
 ]
 }
 ]
 },
 {
 path: '/',
 element: <GuestGuard />,
 children: [
 { path: 'login', element: <Login /> },
 { path: 'signup', element: <Signup /> },
 { path: 'forgot-password', element: <ForgotPassword /> },
 { path: 'reset-password', element: <Navigate to="/forgot-password" replace /> },
 ]
 }
]);
