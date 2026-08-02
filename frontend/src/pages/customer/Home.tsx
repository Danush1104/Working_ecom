import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { HeroCarousel } from '../../components/customer/HeroCarousel';
import { FilterToolbar } from '../../components/ui/FilterToolbar';
import { CategoryCarousel } from '../../components/customer/CategoryCarousel';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useAllReviews } from '../../hooks/useAllReviews';
import { ProductCard } from '../../components/customer/ProductCard';
import { Star, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
 const { data: products = [], isLoading: isLoadingProducts, isError: isErrorProducts } = useProducts();
 const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
 const { data: allReviews = [] } = useAllReviews();
 const activeReviews = allReviews.filter(r => r.status === 'ACTIVE'|| r.status === undefined)
 .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
 .slice(0, 3); // Get 3 recent active reviews
 
 // Filter States
 const [activeCategory, setActiveCategory] = useState('All');
 const [searchQuery, setSearchQuery] = useState('');
 const [sortBy, setSortBy] = useState('newest');
 const [ratingFilter, setRatingFilter] = useState<number | null>(null);
 const [priceFilter, setPriceFilter] = useState<string>('');

 // Client-side filtering and sorting
 const filteredProducts = useMemo(() => {
 let result = [...products];

 // 1. Category Filter
 if (activeCategory !== 'All') {
 result = result.filter(p => p.category === activeCategory);
 }

 // 2. Search Filter
 if (searchQuery.trim()) {
 const q = searchQuery.toLowerCase();
 result = result.filter(p => 
 p.name.toLowerCase().includes(q) || 
 p.description?.toLowerCase().includes(q) ||
 p.category.toLowerCase().includes(q)
 );
 }

 // 3. Rating Filter
 if (ratingFilter !== null) {
 result = result.filter(p => (p.average_rating || 0) >= ratingFilter);
 }

 // 4. Price Filter
 if (priceFilter === 'under_1000') {
 result = result.filter(p => p.price < 1000);
 } else if (priceFilter === '1000_5000') {
 result = result.filter(p => p.price >= 1000 && p.price <= 5000);
 } else if (priceFilter === 'over_5000') {
 result = result.filter(p => p.price > 5000);
 }

 // 5. Sorting
 result.sort((a, b) => {
 switch (sortBy) {
 case 'price_low':
 return a.price - b.price;
 case 'price_high':
 return b.price - a.price;
 case 'rating':
 return (b.average_rating || 0) - (a.average_rating || 0);
 case 'newest':
 default:
 return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
 }
 });

 return result;
 }, [products, activeCategory, searchQuery, ratingFilter, priceFilter, sortBy]);

 const handleClearFilters = () => {
 setActiveCategory('All');
 setSearchQuery('');
 setRatingFilter(null);
 setPriceFilter('');
 setSortBy('newest');
 };

 const isLoading = isLoadingProducts || isLoadingCategories;
 const isError = isErrorProducts;

 return (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 >
  {/* Full-width Hero Section */}
  <section className="w-full relative -mt-8 mb-8 sm:mb-12">
    <HeroCarousel />
  </section>

  {/* Contained content below Hero */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

 {/* Categories Carousel */}
 <section className="pt-2">
 <CategoryCarousel 
 categories={categories}
 activeCategory={activeCategory}
 onCategorySelect={setActiveCategory}
 />
 </section>

 {/* Filter Toolbar Section */}
 <section className="pt-2 sticky top-20 z-30">
 <FilterToolbar 
 categories={categories}
 activeCategory={activeCategory}
 onCategoryChange={setActiveCategory}
 sortBy={sortBy}
 onSortChange={setSortBy}
 ratingFilter={ratingFilter}
 onRatingChange={setRatingFilter}
 priceFilter={priceFilter}
 onPriceChange={setPriceFilter}
 onClearFilters={handleClearFilters}
 />
 </section>

 {/* Products Display */}
 <section className="py-4 min-h-[500px]">
 <SectionHeader 
 title={
 searchQuery ?`Search Results for"${searchQuery}"` :
 activeCategory === 'All'?"All Products" :`${activeCategory} Products`
 } 
 actionLink={undefined} 
 />
 
 {isLoading ? (
 <div className="flex justify-center py-20">
 <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
 </div>
 ) : isError ? (
 <div className="text-center py-20 text-red-400 bg-red-900/10 rounded-3xl border border-red-500/20">
 <p className="font-medium text-lg">Failed to load products. Please try again later.</p>
 </div>
 ) : filteredProducts.length > 0 ? (
 <motion.div 
 layout
 className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
 >
 <AnimatePresence mode="popLayout">
 {filteredProducts.map(product => (
 <motion.div
 layout
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 transition={{ duration: 0.2 }}
 key={product.id}
 >
 <ProductCard {...product} />
 </motion.div>
 ))}
 </AnimatePresence>
 </motion.div>
 ) : (
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-center py-20 bg-bg-card/5 rounded-3xl border border-white/10 backdrop-blur-md"
 >
 <p className="text-text-secondary font-medium text-lg">No products found matching your filters.</p>
 <button 
 onClick={handleClearFilters}
 className="mt-4 px-6 py-2 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/30 hover:bg-cyan-500/20 transition-all font-medium"
 >
 Clear filters
 </button>
 </motion.div>
 )}
 </section>

 {/* Customer Reviews Section */}
 <section className="py-16 border-t border-white/5">
 <div className="flex items-center justify-between mb-10">
 <div>
 <h2 className="text-3xl font-playfair font-bold text-white mb-2">Customer Reviews</h2>
 <p className="text-text-secondary font-medium">Real feedback from the STOREFRONT community.</p>
 </div>
 <Link to="/reviews" className="hidden sm:flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold group transition-colors">
 View All Reviews <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>

 {activeReviews.length === 0 ? (
 <div className="text-center py-12 bg-bg-card/40 rounded-3xl border border-white/5">
 <MessageSquare className="h-12 w-12 mx-auto mb-4 text-text-secondary" />
 <p className="text-text-secondary font-medium">No reviews yet.</p>
 </div>
 ) : (
 <div className="grid md:grid-cols-3 gap-6">
 {activeReviews.map((review, idx) => (
 <motion.div 
 key={review.review_id}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: idx * 0.1 }}
 className="p-6 bg-bg-card/60 hover:bg-bg-card/80 backdrop-blur-xl rounded-[24px] border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-soft flex flex-col"
 >
 <div className="flex justify-between items-start mb-4">
 <div className="flex gap-4">
 <div className="h-10 w-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg shrink-0">
 {review.user_name?.[0]?.toUpperCase() || 'U'}
 </div>
 <div>
 <p className="font-semibold text-white text-sm leading-tight">{review.user_name || 'Anonymous'}</p>
 <div className="flex text-yellow-400 mt-1">
 {[1, 2, 3, 4, 5].map(star => (
 <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-current': 'text-text-secondary'}`} />
 ))}
 </div>
 </div>
 </div>
 
 <div className="flex items-center gap-1 text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
 <CheckCircle2 className="w-3 h-3" />
 Verified
 </div>
 </div>
 
 <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap flex-1 line-clamp-4">{review.review}</p>
 <div className="mt-4 pt-4 border-t border-white/5 text-[11px] font-medium text-text-secondary">
 {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
 </div>
 </motion.div>
 ))}
 </div>
 )}
 
 <div className="mt-8 text-center sm:hidden">
 <Link to="/reviews" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold group transition-colors">
 View All Reviews <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>
 </section>
  </div>
  </motion.div>
  );
}
