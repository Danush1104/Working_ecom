import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Truck, ShieldCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PriceTag } from '../../components/ui/PriceTag';
import { QuantitySelector } from '../../components/ui/QuantitySelector';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { ProductCard } from '../../components/customer/ProductCard';
import { useWishlist } from '../../context/WishlistContext';
import { useProduct, useProducts } from '../../hooks/useProducts';
import { useProductInventory } from '../../hooks/useInventory';
import { useAddToCart } from '../../hooks/useCart';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/Skeleton';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const { data: product, isLoading, isError } = useProduct(id || '');
  const { data: products } = useProducts();
  const { data: inventory, isLoading: isLoadingInv, isError: isErrorInv } = useProductInventory(id || '');
  const addToCartMutation = useAddToCart();
  
  const [quantity, setQuantity] = useState(1);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        <div className="pt-2"><Skeleton className="h-6 w-32" /></div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-8 w-32 mb-6" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <div className="py-6 border-y border-gray-100 dark:border-gray-800 space-y-6">
              <Skeleton className="h-10 w-32" />
              <div className="flex gap-4">
                <Skeleton className="h-14 flex-1 rounded-xl" />
                <Skeleton className="h-14 w-14 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The product you are looking for doesn't exist or has been removed.</p>
        <Link to="/products" className="text-primary hover:underline">Back to Products</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const relatedProducts = products?.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4) || [];
  
  // Safe defaults if inventory is loading or failed
  const hasInventoryRecord = inventory !== undefined && inventory !== null;
  const available = inventory?.available ?? 0;
  const isOutOfStock = available === 0;

  const handleAddToCart = () => {
    if (!isAuthenticated || !user?.userId) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }

    addToCartMutation.mutate({
      user_id: user.userId,
      product_id: product.id,
      quantity
    });
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.image_url 
      });
      toast.success('Added to wishlist');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16"
    >
      {/* Breadcrumb / Back */}
      <div className="pt-2">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 group cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300">
          <img 
            src={product.image_url || 'https://via.placeholder.com/600'} 
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
        </div>

        {/* Details */}
        <div className="space-y-8">
          <div>
            <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <PriceTag price={product.price} size="lg" />
              
              {isLoadingInv ? (
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
              ) : isErrorInv ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                  <AlertCircle className="h-3.5 w-3.5" /> Error loading stock
                </span>
              ) : !hasInventoryRecord ? (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  No inventory record
                </span>
              ) : isOutOfStock ? (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Out of Stock
                </span>
              ) : available < 10 ? (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                  Low Stock ({available} left)
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  In Stock
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              {product.description}
            </p>
          </div>

          <div className="py-6 border-y border-gray-100 dark:border-gray-800 space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Quantity</span>
              <QuantitySelector 
                quantity={quantity} 
                onChange={setQuantity} 
                maxQuantity={available > 0 ? available : 1} 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || !product.is_active || isOutOfStock || !hasInventoryRecord || isErrorInv || isLoadingInv}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white h-14 rounded-xl font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all shadow-soft disabled:opacity-50 disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                {addToCartMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" /> Add to Cart
                  </>
                )}
              </button>
              <button 
                onClick={handleToggleWishlist}
                aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                className={`sm:w-14 h-14 flex items-center justify-center rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                  inWishlist 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400'
                }`}
              >
                <Heart className="h-5 w-5" fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Truck className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 shrink-0" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
              <ShieldCheck className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 shrink-0" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <SectionHeader title="You might also like" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
