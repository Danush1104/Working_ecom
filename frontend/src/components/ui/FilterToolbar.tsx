import { ChevronDown, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface FilterToolbarProps {
 categories: { id: string; name: string }[];
 activeCategory: string;
 onCategoryChange: (category: string) => void;
 sortBy: string;
 onSortChange: (sort: string) => void;
 ratingFilter: number | null;
 onRatingChange: (rating: number | null) => void;
 priceFilter: string;
 onPriceChange: (price: string) => void;
 onClearFilters: () => void;
}

export function FilterToolbar({
 categories,
 activeCategory,
 onCategoryChange,
 sortBy,
 onSortChange,
 ratingFilter,
 onRatingChange,
 priceFilter,
 onPriceChange,
 onClearFilters
}: FilterToolbarProps) {

 return (
 <div className="bg-bg-primary border border-border-subtle rounded-full p-2 shadow-sm">
 <div className="flex flex-col md:flex-row items-center gap-2 w-full overflow-hidden">
 
 {/* Search Input Removed as per user request to avoid duplicates */}

 {/* Category Dropdown */}
 <div className="relative shrink-0 w-full md:w-auto">
 <select 
 value={activeCategory}
 onChange={(e) => onCategoryChange(e.target.value)}
 className="w-full md:w-auto h-11 pl-4 pr-10 bg-bg-secondary hover:bg-bg-primary rounded-full border border-border-subtle text-sm font-medium text-text-primary focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all cursor-pointer appearance-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]"
 >
 <option value="All" className="bg-bg-card text-text-primary">All Categories</option>
 {categories.map(c => (
 <option key={c.id} value={c.name} className="bg-bg-card text-text-primary">{c.name}</option>
 ))}
 </select>
 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
 </div>

 {/* Price Dropdown */}
 <div className="relative shrink-0 w-full md:w-auto">
 <select 
 value={priceFilter}
 onChange={(e) => onPriceChange(e.target.value)}
 className="w-full md:w-auto h-11 pl-4 pr-10 bg-bg-secondary hover:bg-bg-primary rounded-full border border-border-subtle text-sm font-medium text-text-primary focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all cursor-pointer appearance-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]"
 >
 <option value="" className="bg-bg-card text-text-primary">Any Price</option>
 <option value="under_1000" className="bg-bg-card text-text-primary">Under ₹1,000</option>
 <option value="1000_5000" className="bg-bg-card text-text-primary">₹1,000 - ₹5,000</option>
 <option value="5000_10000" className="bg-bg-card text-text-primary">₹5,000 - ₹10,000</option>
 <option value="10000_25000" className="bg-bg-card text-text-primary">₹10,000 - ₹25,000</option>
 <option value="25000_50000" className="bg-bg-card text-text-primary">₹25,000 - ₹50,000</option>
 <option value="50000_100000" className="bg-bg-card text-text-primary">₹50,000 - ₹1,00,000</option>
 <option value="over_100000" className="bg-bg-card text-text-primary">Above ₹1,00,000</option>
 </select>
 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
 </div>

 {/* Rating Dropdown */}
 <div className="relative shrink-0 w-full md:w-auto">
 <select 
 value={ratingFilter || ''}
 onChange={(e) => onRatingChange(e.target.value ? Number(e.target.value) : null)}
 className="w-full md:w-auto h-11 pl-4 pr-10 bg-bg-secondary hover:bg-bg-primary rounded-full border border-border-subtle text-sm font-medium text-text-primary focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all cursor-pointer appearance-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]"
 >
 <option value="" className="bg-bg-card text-text-primary">Any Rating</option>
 <option value="5" className="bg-bg-card text-text-primary">⭐⭐⭐⭐⭐ 5 Stars</option>
 <option value="4" className="bg-bg-card text-text-primary">⭐⭐⭐⭐ 4 Stars & Up</option>
 <option value="3" className="bg-bg-card text-text-primary">⭐⭐⭐ 3 Stars & Up</option>
 <option value="2" className="bg-bg-card text-text-primary">⭐⭐ 2 Stars & Up</option>
 <option value="1" className="bg-bg-card text-text-primary">⭐ 1 Star & Up</option>
 </select>
 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
 </div>

 {/* Sort Dropdown */}
 <div className="relative shrink-0 w-full md:w-auto">
 <select 
 value={sortBy}
 onChange={(e) => onSortChange(e.target.value)}
 className="w-full md:w-auto h-11 pl-4 pr-10 bg-bg-secondary hover:bg-bg-primary rounded-full border border-border-subtle text-sm font-medium text-text-primary focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all cursor-pointer appearance-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]"
 >
 <option value="newest" className="bg-bg-card text-text-primary">Sort: Newest</option>
 <option value="price_low" className="bg-bg-card text-text-primary">Sort: Price Low-High</option>
 <option value="price_high" className="bg-bg-card text-text-primary">Sort: Price High-Low</option>
 <option value="rating" className="bg-bg-card text-text-primary">Sort: Highest Rated</option>
 </select>
 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
 </div>

 {/* Clear Filters */}
 <motion.button
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 onClick={onClearFilters}
 className="shrink-0 w-full md:w-11 h-11 bg-bg-card/5 hover:bg-red-500/20 rounded-full border border-white/5 hover:border-red-500/50 flex items-center justify-center text-text-secondary hover:text-red-400 transition-all focus:outline-none"
 title="Clear Filters"
 >
 <X className="w-4 h-4 hidden md:block" />
 <span className="md:hidden text-sm font-medium">Clear Filters</span>
 </motion.button>
 
 </div>
 </div>
 );
}
