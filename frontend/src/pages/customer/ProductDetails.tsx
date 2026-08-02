import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Truck, ShieldCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PriceTag } from '../../components/ui/PriceTag';
import { QuantitySelector } from '../../components/ui/QuantitySelector';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { ProductCard } from '../../components/customer/ProductCard';
import { ReviewSection } from '../../components/customer/ReviewSection';
import { Star } from 'lucide-react';
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
 const [activeImageIndex, setActiveImageIndex] = useState(0);
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
 <div className="py-6 border-y border-border-subtle dark:border-border-subtle space-y-6">
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
 <h2 className="text-2xl font-bold text-text-primary mb-2">Product not found</h2>
 <p className="text-text-secondary dark:text-text-secondary mb-6">The product you are looking for doesn't exist or has been removed.</p>
 <Link to="/products" className="text-primary hover:underline">Back to Products</Link>
 </div>
 );
 }

 const inWishlist = isInWishlist(product.id);
 const relatedProducts = products?.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4) || [];
 const allImages = [product.image_url, ...(product.images || [])].filter(Boolean) as string[];
 const displayImage = allImages.length > 0 ? allImages[activeImageIndex] :`https://placehold.co/600x750/151A25/ffffff?text=${product.name.charAt(0)}`;
 
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
 addToWishlist(product.id);
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
 <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary dark:text-text-secondary hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1 -ml-2">
 <ArrowLeft className="h-4 w-4" /> Back to Products
 </Link>
 </div>

 <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
 {/* Image Gallery */}
 <div className="md:sticky md:top-24 h-fit space-y-4">
 <div className="aspect-[4/5] bg-bg-secondary dark:bg-bg-card rounded-[32px] overflow-hidden border border-border-subtle dark:border-border-subtle group cursor-pointer shadow-soft hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 relative">
 <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/20 to-transparent z-10" />
 <img 
 key={displayImage}
 src={displayImage} 
 alt={product.name}
 className="w-full h-full object-cover object-center animate-in fade-in zoom-in-[0.98] duration-500"
 />
 </div>
 </div>

 {/* Details */}
 <div className="space-y-6">
 {!product.is_active && (
 <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
 <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
 <div>
 <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">Product Unavailable</h3>
 <p className="text-sm text-red-400 mt-1">This product is no longer available for purchase.</p>
 </div>
 </div>
 )}
 <div>
 <p className="text-sm font-space font-bold text-primary uppercase tracking-wider mb-3">{product.category}</p>
 <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-text-primary dark:text-text-primary tracking-tight mb-2 leading-tight">{product.name}</h1>
 
 <div className="flex items-center gap-2 mb-3">
 <div className="flex text-yellow-500">
 <Star className="h-4 w-4 fill-current" />
 </div>
 <span className="font-bold text-text-primary">{product.average_rating?.toFixed(1) || '0.0'}</span>
 <a href="#reviews" className="text-sm text-primary hover:underline font-medium">
 ({product.total_reviews || 0} Reviews)
 </a>
 </div>

 <div className="flex items-center gap-4 mb-4">
 <PriceTag price={product.price} size="lg" />
 
 {isLoadingInv ? (
 <div className="h-6 w-20 bg-bg-secondary animate-pulse rounded-full"></div>
 ) : isErrorInv ? (
 <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
 <AlertCircle className="h-3.5 w-3.5" /> Error loading stock
 </span>
 ) : !hasInventoryRecord ? (
 <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-bg-secondary text-text-secondary dark:bg-bg-card dark:text-text-secondary">
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
 <p className="text-text-secondary dark:text-text-secondary leading-relaxed text-lg font-space max-w-xl">
 {product.description}
 </p>
 </div>

 <div className="py-6 border-y border-border-subtle dark:border-border-subtle space-y-6">
 <div className="flex items-center gap-4">
 <span className="text-sm font-medium text-text-primary">Quantity</span>
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
 className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-bg-primary rounded-xl font-space font-bold uppercase tracking-wider hover:bg-primary-hover hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-[0_4px_20px_rgba(21,216,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
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
 aria-label={inWishlist ?"Remove from Wishlist" :"Add to Wishlist"}
 className={`sm:w-14 h-14 flex items-center justify-center rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
 inWishlist 
 ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
 : 'bg-bg-secondary dark:bg-bg-card text-text-secondary dark:text-text-secondary hover:bg-bg-secondary hover:text-red-500 dark:hover:text-red-400'
 }`}
 >
 <Heart className="h-5 w-5" fill={inWishlist ?"currentColor" :"none"} />
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
 <div className="flex gap-3 text-sm text-text-secondary dark:text-text-secondary">
 <Truck className="h-5 w-5 text-text-secondary shrink-0" />
 <span>Free shipping on orders over ₹2,500</span>
 </div>
 <div className="flex gap-3 text-sm text-text-secondary dark:text-text-secondary">
 <ShieldCheck className="h-5 w-5 text-text-secondary shrink-0" />
 <span>30-day money-back guarantee</span>
 </div>
 </div>

 {allImages.length > 1 && (
 <div className="pt-6 border-t border-border-subtle dark:border-border-subtle">
 <h3 className="text-sm font-medium text-text-primary mb-4">Additional Photos</h3>
 <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
 {allImages.map((img, idx) => {
 const isActive = idx === activeImageIndex;
 return (
 <button
 key={`${img}-${idx}`}
 onClick={() => setActiveImageIndex(idx)}
 className={`relative w-20 h-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 focus:outline-none hover:scale-105 ${
 isActive ? 'border-cyan-500 shadow-[0_0_15px_rgba(21,216,255,0.4)]': 'border-transparent hover:border-cyan-500/50'
 }`}
 >
 <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover bg-bg-card" />
 <div className={`absolute inset-0 transition-colors duration-300 ${isActive ? 'bg-transparent': 'bg-black/40 hover:bg-transparent'}`} />
 </button>
 );
 })}
 </div>
 </div>
 )}

 </div>
 </div>

 {/* Related Products */}
 {relatedProducts.length > 0 && (
 <section className="pt-8">
 <SectionHeader title="Recommended For You" />
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
 {relatedProducts.map(p => (
 <ProductCard key={p.id} {...p} />
 ))}
 </div>
 </section>
 )}

 {/* Reviews Section - Placed at the very bottom */}
 <div id="reviews" className="pt-12 mt-8 border-t border-border-subtle dark:border-border-subtle">
 <ReviewSection productId={product.id} product={product} />
 </div>
 </motion.div>
 );
}
