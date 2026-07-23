import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { ProductCard } from '../../components/customer/ProductCard';
import { Pagination } from '../../components/ui/Pagination';
import { useProducts } from '../../hooks/useProducts';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { DualRangeSlider } from '../../components/ui/DualRangeSlider';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sliderMax, setSliderMax] = useState(1000);
  
  const { data: products, isLoading, isError } = useProducts();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
      setPage(1);
    }
  }, [searchParams]);

  const categories = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  // Adjust max slider dynamically based on products if desired, or keep fixed
  useMemo(() => {
    if (products && products.length > 0) {
      const max = Math.max(...products.map(p => p.price));
      setSliderMax(Math.ceil(max));
    }
  }, [products]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
    // update URL
    if (val.trim()) {
      searchParams.set('q', val);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    let filtered = products;
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }
    if (minPrice !== '') {
      filtered = filtered.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice !== '') {
      filtered = filtered.filter(p => p.price <= Number(maxPrice));
    }
    
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        // assuming newer products have higher IDs or parse created_at if available
        // as a fallback we leave it as is (backend default)
        break;
    }
    
    return filtered;
  }, [products, selectedCategories, searchQuery, minPrice, maxPrice, sortBy]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex items-center justify-between">
          <h1 className="text-3xl font-playfair font-bold text-gray-900 dark:text-white">All Products</h1>
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 p-2 bg-white dark:bg-bg-card border border-gray-100 dark:border-border-subtle rounded-lg shadow-soft"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Sidebar Filters (Desktop & Mobile if toggled) */}
        <aside className={`md:w-64 shrink-0 space-y-8 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          <div>
            <h3 className="text-lg font-playfair font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Categories
            </h3>
            <div className="space-y-3">
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-3 cursor-pointer group">
                  <input id="input_wdlk"  
                    type="checkbox" 
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:hover:text-white transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-playfair font-semibold text-gray-900 dark:text-white mb-4">Price Range</h3>
            <div className="space-y-6">
              <DualRangeSlider 
                min={0}
                max={sliderMax}
                value={[
                  minPrice === '' ? 0 : minPrice, 
                  maxPrice === '' ? sliderMax : maxPrice
                ]}
                onChange={([min, max]) => {
                  setMinPrice(min);
                  setMaxPrice(max);
                  setPage(1);
                }}
              />
              <div className="flex items-center gap-2">
                <input id="input_uuel"  
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white dark:bg-bg-card dark:text-white dark:border-border-subtle outline-none focus:border-primary" 
                />
                <span className="text-gray-500 dark:text-gray-400">-</span>
                <input id="input_pjxx"  
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white dark:bg-bg-card dark:text-white dark:border-border-subtle outline-none focus:border-primary" 
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Product Grid */}
        <div className="flex-1 space-y-6">
          <div className="hidden md:flex items-center justify-between gap-4">
            <h1 className="text-3xl font-playfair font-bold text-gray-900 dark:text-white">All Products</h1>
            
            <div className="flex-1 max-w-md ml-auto flex items-center gap-4">
              <input id="input_ujfd"  
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-11 px-6 rounded-full border border-gray-200 dark:border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:bg-bg-card dark:text-white placeholder:text-gray-400 shadow-soft"
              />
              
              <div className="relative shrink-0 group">
                <select id="select_xffe"  
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as SortOption); setPage(1); }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-bg-card border border-gray-200 dark:border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : isError ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-10 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20"
            >
              <p className="text-red-500 font-medium">Failed to load products.</p>
            </motion.div>
          ) : paginatedProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700"
            >
              <p className="text-gray-500 dark:text-gray-400">No products found matching your filters.</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              {paginatedProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.3, delay: (i % 4) * 0.05 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isLoading && !isError && totalPages > 1 && (
            <div className="pt-8 flex justify-center border-t border-gray-100 dark:border-gray-700">
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
