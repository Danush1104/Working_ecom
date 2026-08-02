import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/customer/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useWishlist } from '../../context/WishlistContext';
import { useProducts } from '../../hooks/useProducts';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';

export default function Wishlist() {
 const { items, isLoading: isWishlistLoading } = useWishlist();
 const { data: allProducts = [], isLoading: isProductsLoading } = useProducts();
 
 // Filter allProducts to only include ones that are in the wishlist
 const wishlistProducts = allProducts.filter(p => items.some(i => i.product_id === p.id));
 const isLoading = isWishlistLoading || isProductsLoading;

 if (items.length === 0) {
 return (
 <div className="max-w-3xl mx-auto py-16 px-4">
 <EmptyState 
 icon={Heart}
 title="Your wishlist is empty"
 description="Save items you love to your wishlist to easily find them later."
 action={
 <Link to="/products" className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-primary text-bg-primary font-medium hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
 Explore Products
 </Link>
 }
 />
 </div>
 );
 }

 if (isLoading) {
 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="flex items-center gap-3 mb-8">
 <Heart className="h-8 w-8 text-primary" fill="currentColor" />
 <h1 className="text-3xl font-bold text-text-primary">My Wishlist</h1>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
 {[1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)}
 </div>
 </div>
 );
 }

 return (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
 >
 <div className="flex items-center justify-between mb-8">
 <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
 <Heart className="h-8 w-8 text-primary" fill="currentColor" />
 My Wishlist
 </h1>
 <span className="text-text-secondary dark:text-text-secondary font-medium">
 {items.length} {items.length === 1 ? 'item': 'items'}
 </span>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
 {wishlistProducts.map(product => (
 <ProductCard 
 key={product.id} 
 id={product.id as string} 
 name={product.name}
 price={product.price}
 image_url={product.image_url}
 category={product.category ||"Saved Item"}
 is_active={product.is_active !== false}
 is_featured={product.is_featured}
 />
 ))}
 </div>
 </motion.div>
 );
}
