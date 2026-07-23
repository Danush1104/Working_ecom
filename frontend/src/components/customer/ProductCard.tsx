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
  is_featured?: boolean;
}

export const ProductCard = React.memo(function ProductCard({ 
  id, 
  name, 
  price, 
  image_url, 
  category, 
  is_active,
  is_featured,
}: ProductCardProps) {
  const addToCartMutation = useAddToCart();
  const { user, isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(id);
      toast.success('Added to wishlist');
    }
  };

  return (
    <Link to={`/product/${id}`} className="group relative block focus:outline-none rounded-2xl ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary">
      <motion.div 
        whileHover={{ y: -8 }}
        className="bg-white dark:bg-bg-card rounded-3xl overflow-hidden border border-gray-100 dark:border-border-subtle shadow-soft hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_20px_rgba(21,216,255,0.15)] transition-all duration-300 group-hover:border-primary/30"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-bg-primary">
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
            {is_featured && (
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                ⭐ Featured
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
          
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20">
            <button 
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || !is_active}
              className="w-full bg-white/90 dark:bg-bg-secondary/90 backdrop-blur-md flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-space font-bold text-gray-900 dark:text-text-primary hover:bg-primary hover:text-bg-primary dark:hover:bg-primary shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
        
        <div className="p-5">
          <p className="text-xs font-space font-medium text-primary uppercase tracking-wider mb-2">{category}</p>
          <h3 className="text-gray-900 dark:text-text-primary font-playfair font-semibold text-lg mb-2 truncate group-hover:text-primary transition-colors">{name}</h3>
          <PriceTag price={price} />
        </div>
      </motion.div>
    </Link>
  );
});
