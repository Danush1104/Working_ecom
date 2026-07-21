import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/customer/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useWishlist } from '../../context/WishlistContext';

export default function Wishlist() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <EmptyState 
          icon={Heart}
          title="Your wishlist is empty"
          description="Save items you love to your wishlist to easily find them later."
          action={
            <Link to="/products" className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-primary text-white font-medium hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
              Explore Products
            </Link>
          }
        />
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" fill="currentColor" />
          My Wishlist
        </h1>
        <span className="text-gray-500 dark:text-gray-400 font-medium">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map(product => (
          <ProductCard 
            key={product.id} 
            id={product.id as string} 
            name={product.name}
            price={product.price}
            image_url={product.image}
            category="Saved Item"
            is_active={true}
          />
        ))}
      </div>
    </motion.div>
  );
}
