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

 const PREDEFINED_ORDER = [
   "Electronics",
   "Fashion",
   "Home & Kitchen",
   "Beauty",
   "Sports",
   "Books",
   "Toys",
   "Automotive",
   "Groceries"
 ];

 const sortedCategories = [...deduplicatedCategories].sort((a, b) => {
   const indexA = PREDEFINED_ORDER.indexOf(a.name);
   const indexB = PREDEFINED_ORDER.indexOf(b.name);
   
   if (indexA !== -1 && indexB !== -1) return indexA - indexB;
   if (indexA !== -1) return -1;
   if (indexB !== -1) return 1;
   
   return (a.display_order || 999) - (b.display_order || 999);
 });

 const displayCategories = [allCategoryItem, ...sortedCategories];

 return (
  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
  <div className="relative group w-full bg-bg-card rounded-[2rem] border border-border-subtle shadow-sm flex items-center p-2">
  {/* Left Gradient & Arrow */}
  <div className="absolute left-2 top-2 bottom-2 w-16 bg-gradient-to-r from-bg-card via-bg-card/80 to-transparent z-10 flex items-center pointer-events-none rounded-l-[1.8rem]">
  <button 
  onClick={(e) => { e.stopPropagation(); scroll('left'); }}
  className="ml-2 w-8 h-8 rounded-full bg-bg-primary shadow-sm border border-border-subtle flex items-center justify-center text-text-primary hover:text-cyan-500 transition-all pointer-events-auto opacity-0 group-hover:opacity-100"
  >
  <ChevronLeft className="w-4 h-4" />
  </button>
  </div>

  {/* Scrollable Container */}
  <div 
  ref={scrollContainerRef}
  className="flex items-center justify-start flex-1 gap-6 sm:gap-10 overflow-x-auto scrollbar-hide px-16 sm:px-20 scroll-smooth"
  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none'}}
  >
  {displayCategories.map((cat) => {
  const isActive = activeCategory === cat.name;
  return (
  <button
  key={cat.id || cat.name}
  onClick={() => onCategorySelect(cat.name)}
  className={`relative flex flex-col items-center gap-2 min-w-[70px] shrink-0 pt-2 pb-3 transition-all duration-300 focus:outline-none group`}
  >
  <div className="w-14 h-14 rounded-full overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
  {cat.icon_url ? (
  <img 
  src={cat.icon_url} 
  alt={cat.name}
  className="w-full h-full object-cover"
  />
  ) : (
  <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
  <ShoppingBag className={`w-5 h-5 ${isActive ? 'text-cyan-500': 'text-text-secondary'}`} />
  </div>
  )}
  </div>
  
  <div className="text-center relative w-full">
  <p className={`text-xs font-semibold whitespace-nowrap transition-colors ${
  isActive ? 'text-cyan-500': 'text-text-secondary group-hover:text-text-primary'
  }`}>
  {cat.name}
  </p>
  {/* Active Cyan Underline */}
  {isActive && (
  <motion.div
  layoutId="activeCategoryUnderline"
  className="absolute -bottom-3 inset-x-0 h-[3px] bg-cyan-500 rounded-t-full"
  initial={false}
  transition={{ type:"spring", stiffness: 300, damping: 30 }}
  />
  )}
  </div>
  </button>
  );
  })}
  </div>

  {/* Right Gradient & Arrow */}
  <div className="absolute right-2 top-2 bottom-2 w-16 bg-gradient-to-l from-bg-card via-bg-card/80 to-transparent z-10 flex items-center justify-end pointer-events-none rounded-r-[1.8rem]">
  <button 
  onClick={(e) => { e.stopPropagation(); scroll('right'); }}
  className="mr-2 w-8 h-8 rounded-full bg-bg-primary shadow-sm border border-border-subtle flex items-center justify-center text-text-primary hover:text-cyan-500 transition-all pointer-events-auto opacity-0 group-hover:opacity-100"
  >
  <ChevronRight className="w-4 h-4" />
  </button>
  </div>
  </div>
  </div>
  );
}
