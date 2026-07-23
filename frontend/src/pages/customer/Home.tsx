import { useState } from 'react';
import { motion } from 'framer-motion';
import { CategoryChip } from '../../components/ui/CategoryChip';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { ProductCard } from '../../components/customer/ProductCard';
import { HeroCarousel } from '../../components/customer/HeroCarousel';
import { ProductSlider } from '../../components/products/ProductSlider';
import { useProducts } from '../../hooks/useProducts';

import { ProductCardSkeleton } from '../../components/ui/Skeleton';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { data: products, isLoading, isError } = useProducts();
  
  const categories = ['All', ...Array.from(new Set(products?.map(p => p.category) || []))];
  
  const featuredProducts = products?.filter(p => p.is_featured === true) || [];
  
  const filteredProducts = activeCategory === 'All' 
    ? featuredProducts 
    : products?.filter(p => p.category === activeCategory) || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12"
    >
      <section>
        <HeroCarousel />
      </section>

      {/* Categories */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <CategoryChip 
              key={category}
              label={category}
              isActive={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            />
          ))}
        </div>
      </section>

      {/* Featured Products Slider */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeader title={activeCategory === 'All' ? "Featured Products" : `${activeCategory} Products`} actionLink="/products" />
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-3xl">
            <p className="font-medium text-lg">Failed to load products. Please try again later.</p>
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="mt-8">
            <ProductSlider products={filteredProducts.slice(0, 10)} />
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No products found in this category.</p>
          </div>
        )}
      </section>
    </motion.div>
  );
}
