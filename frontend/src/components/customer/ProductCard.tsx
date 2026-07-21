import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import { PriceTag } from '../ui/PriceTag';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useAddToCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';
import React from 'react';


interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
}

export const ProductCard = React.memo(function ProductCard({ 
  id, 
  name, 
  price, 
  image_url, 
  category, 
  is_active,
}: ProductCardProps) {
  const addToCartMutation = useAddToCart();
  const { user, isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user?.userId) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    
    if (!is_active) {
      toast.error('Product is unavailable');
      return;
    }
    
    addToCartMutation.mutate({
      user_id: user.userId,
      product_id: id,
      quantity: 1
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({ id, name, price, image: image_url });
      toast.success('Added to wishlist');
    }
  };

  return (
    <Link to={`/product/${id}`} className="group relative block focus:outline-none rounded-2xl ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary">
      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
          <img 
            src={image_url || 'https://via.placeholder.com/400'} 
            alt={name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {!is_active && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                UNAVAILABLE
              </span>
            )}
          </div>
          
          <button 
            onClick={handleToggleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-sm backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
              inWishlist 
                ? 'bg-red-50/90 dark:bg-red-900/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/60' 
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <Heart className="h-4 w-4" fill={inWishlist ? "currentColor" : "none"} />
          </button>
          
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <button 
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || !is_active}
              className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-900 dark:text-white hover:bg-primary hover:text-white dark:hover:bg-primary shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addToCartMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Adding...
                </span>
              ) : (
                <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
              )}
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">{category}</p>
          <h3 className="text-gray-900 dark:text-gray-100 font-semibold mb-1 truncate group-hover:text-primary transition-colors">{name}</h3>
          <PriceTag price={price} />
        </div>
      </motion.div>
    </Link>
  );
});
