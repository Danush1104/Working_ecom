import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAddToCart } from '../../hooks/useCart';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category: string;
  is_active?: boolean;
  is_featured?: boolean;
  average_rating?: number;
  total_reviews?: number;
  inventory?: { stock: number; available: number; reserved?: number };
}

export function ProductCard({ 
  id, 
  name, 
  price, 
  image_url, 
  category, 
  is_active = true,
  is_featured,
  average_rating = 0,
  total_reviews = 0,
  inventory
}: ProductCardProps) {
  const { user } = useAuth();
  const addToCartMutation = useAddToCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [isAdding, setIsAdding] = useState(false);
  const inWishlist = isInWishlist(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!is_active || !user) return;
    
    setIsAdding(true);
    addToCartMutation.mutate(
      { user_id: user!.userId, product_id: id, quantity: 1 },
      { onSettled: () => setTimeout(() => setIsAdding(false), 600) }
    );
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  const renderStars = () => {
    if (total_reviews === 0) return <span className="text-gray-500 font-normal">☆☆☆☆☆ No reviews</span>;
    
    const roundedRating = Math.round(average_rating * 2) / 2;
    let stars = '';
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars += '★';
      } else if (i - 0.5 === roundedRating) {
        stars += '★';
      } else {
        stars += '☆';
      }
    }
    
    return (
      <>
        <span className="text-yellow-400 tracking-wider mr-1 text-[13px]">{stars}</span>
        <span className="font-semibold text-white">{average_rating.toFixed(1)}</span>
        <span className="text-gray-400 ml-1">({total_reviews})</span>
      </>
    );
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(p);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative bg-bg-card/60 backdrop-blur-xl rounded-[24px] border border-white/5 hover:border-cyan-500/30 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_8px_32px_rgba(21,216,255,0.1)]"
    >
      <Link to={`/product/${id}`} className="block relative aspect-[4/5] overflow-hidden bg-white/5">
        <img
          src={image_url || `https://placehold.co/400x500/151A25/ffffff?text=${name.charAt(0)}`}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent opacity-60 mix-blend-multiply" />
        
        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 z-10 
            ${inWishlist 
              ? 'bg-red-500/20 border-red-500/50' 
              : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30'
            } border`}
        >
          <motion.div
            animate={{ scale: inWishlist ? [1, 1.5, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              className={`w-4 h-4 transition-colors duration-300 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-white'}`} 
            />
          </motion.div>
        </button>

        {/* Stock/Featured Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-2 max-w-[70%]">
          {is_featured && (
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 shrink-0">
              ⭐ Featured
            </span>
          )}
          {inventory ? (
            inventory.available <= 0 ? (
              <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm shrink-0">
                Out of Stock
              </span>
            ) : inventory.available <= 10 ? (
              <span className="bg-orange-500/90 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm shrink-0">
                Low Stock ({inventory.available} left)
              </span>
            ) : null // In Stock usually not explicitly shown as a badge on the image to keep it clean, or we can show it
          ) : !is_active ? (
            <span className="bg-gray-500/90 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm shrink-0">
              Unavailable
            </span>
          ) : null}
        </div>

        {/* Quick View Overlay (Desktop) */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center pointer-events-none">
          <div className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-medium flex items-center gap-2 backdrop-blur-md translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <Eye className="w-4 h-4" /> Quick View
          </div>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1 relative z-20">
        <div className="mb-2 uppercase tracking-wider text-[10px] font-bold text-cyan-500">
          {category}
        </div>
        
        <Link to={`/product/${id}`} className="group-hover:text-cyan-400 transition-colors">
          <h3 className="text-lg font-semibold text-white line-clamp-2 leading-tight mb-1">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 text-xs mb-3 font-medium">
          {renderStars()}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Price</p>
            <span className="text-xl font-bold text-white tracking-tight">
              {formatPrice(price)}
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!is_active || isAdding}
            className={`
              relative overflow-hidden h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300
              ${!is_active 
                ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed' 
                : 'bg-cyan-500 text-bg-primary hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105'
              }
            `}
          >
            <AnimatePresence mode="wait">
              {isAdding ? (
                <motion.div
                  key="adding"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <div className="w-5 h-5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <ShoppingCart className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
