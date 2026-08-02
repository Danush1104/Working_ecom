import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import type { Category } from '../../api/productService';

interface CategoryCarouselProps {
 categories: Category[];
 activeCategory: string;
 onCategorySelect: (category: string) => void;
}

export function CategoryCarousel({ categories, activeCategory, onCategorySelect }: CategoryCarouselProps) {
 const scrollContainerRef = useRef<HTMLDivElement>(null);

 const scroll = (direction: 'left'| 'right') => {
 if (scrollContainerRef.current) {
 const scrollAmount = 300;
 scrollContainerRef.current.scrollBy({
 left: direction === 'left'? -scrollAmount : scrollAmount,
 behavior: 'smooth'
 });
 }
 };

 const deduplicatedCategories = categories.reduce((acc, cat) => {
 const normalizedName = cat.name.trim().toLowerCase();
 const existing = acc.find(c => c.name.trim().toLowerCase() === normalizedName);
 if (existing) {
 existing.product_count = (existing.product_count || 0) + (cat.product_count || 0);
 existing.icon_url = existing.icon_url || cat.icon_url;
 existing.banner_url = existing.banner_url || cat.banner_url;
 existing.display_order = Math.min(existing.display_order ?? 99, cat.display_order ?? 99);
 existing.featured = existing.featured || cat.featured;
 } else {
 acc.push({ ...cat });
 }
 return acc;
 }, [] as Category[]);

 const allCategoryItem = {
 id: 'all',
 name: 'All',
 icon_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop',
 product_count: deduplicatedCategories.reduce((sum, cat) => sum + (cat.product_count || 0), 0),
 display_order: 0
 } as Category;

 const displayCategories = [allCategoryItem, ...deduplicatedCategories].sort((a, b) => (a.display_order || 99) - (b.display_order || 99));

 return (
 <div className="relative group w-full py-4">
 {/* Left Gradient & Arrow */}
 <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent z-10 flex items-center pointer-events-none">
 <button 
 onClick={(e) => { e.stopPropagation(); scroll('left'); }}
 className="ml-2 w-10 h-10 rounded-full bg-bg-card/5 backdrop-blur-md border border-border-subtle flex items-center justify-center text-text-primary hover:bg-bg-card/10 hover:border-primary/50 transition-all pointer-events-auto opacity-0 group-hover:opacity-100 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
 >
 <ChevronLeft className="w-5 h-5" />
 </button>
 </div>

 {/* Scrollable Container */}
 <div 
 ref={scrollContainerRef}
 className="flex items-center gap-4 overflow-x-auto scrollbar-hide px-4 md:px-12 scroll-smooth"
 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none'}}
 >
 {displayCategories.map((cat) => {
 const isActive = activeCategory === cat.name;
 return (
 <button
 key={cat.id || cat.name}
 onClick={() => onCategorySelect(cat.name)}
 className={`relative flex flex-col items-center gap-3 min-w-[100px] shrink-0 p-3 rounded-2xl transition-all duration-300 focus:outline-none ${
 isActive 
 ? 'bg-bg-card/5 border border-primary/30 shadow-[0_0_20px_rgba(21,216,255,0.15)] scale-105'
 : 'bg-transparent border border-transparent hover:bg-bg-card/5 hover:border-border-subtle'
 }`}
 >
 {isActive && (
 <motion.div
 layoutId="activeCategoryGlow"
 className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent -z-10"
 initial={false}
 transition={{ type:"spring", stiffness: 300, damping: 30 }}
 />
 )}
 
 <div className={`w-16 h-16 rounded-full overflow-hidden p-0.5 transition-all duration-300 ${
 isActive ? 'bg-gradient-to-tr from-primary to-purple-500 shadow-[0_0_15px_rgba(21,216,255,0.4)]': 'bg-bg-card/10 group-hover:bg-bg-card/20'
 }`}>
 <div className="w-full h-full rounded-full overflow-hidden bg-bg-card flex items-center justify-center">
 {cat.icon_url ? (
 <img 
 src={cat.icon_url} 
 alt={cat.name}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
 />
 ) : (
 <ShoppingBag className={`w-6 h-6 ${isActive ? 'text-cyan-400': 'text-text-secondary'} group-hover:scale-110 transition-transform duration-500`} />
 )}
 </div>
 </div>
 
 <div className="text-center">
 <p className={`text-sm font-space font-semibold transition-colors ${
 isActive ? 'text-primary': 'text-text-secondary hover:text-text-primary'
 }`}>
 {cat.name}
 </p>
 </div>
 </button>
 );
 })}
 </div>

 {/* Right Gradient & Arrow */}
 <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-bg-primary via-bg-primary/80 to-transparent z-10 flex items-center justify-end pointer-events-none">
 <button 
 onClick={(e) => { e.stopPropagation(); scroll('right'); }}
 className="mr-2 w-10 h-10 rounded-full bg-bg-card/5 backdrop-blur-md border border-border-subtle flex items-center justify-center text-text-primary hover:bg-bg-card/10 hover:border-primary/50 transition-all pointer-events-auto opacity-0 group-hover:opacity-100 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
 >
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 </div>
 );
}
