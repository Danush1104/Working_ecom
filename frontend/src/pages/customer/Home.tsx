import { useState } from 'react';
import { motion } from 'framer-motion';
import { CategoryChip } from '../../components/ui/CategoryChip';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { ProductCard } from '../../components/customer/ProductCard';
import { useProducts } from '../../hooks/useProducts';

import { Link } from 'react-router-dom';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { data: products, isLoading, isError } = useProducts();
  
  const categories = ['All', ...Array.from(new Set(products?.map(p => p.category) || []))];
  
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products?.filter(p => p.category === activeCategory);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12"
    >
      {/* Promotional Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gray-900 text-white shadow-lg">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000" 
            alt="Promo" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 p-8 md:p-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Summer Sale is Here
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Get up to 50% off on selected items. Limited time offer.
          </p>
          <Link to="/products" className="inline-block bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm">
            Shop Now
          </Link>
        </div>
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

      {/* Products */}
      <section>
        <SectionHeader title={activeCategory === 'All' ? "Products" : `${activeCategory} Products`} actionLink="/products" />
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="text-center py-10 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
            <p className="text-red-500 font-medium">Failed to load products. Please try again.</p>
          </div>
        ) : !filteredProducts?.length ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.slice(0, 8).map((product, i) => (
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
          </div>
        )}
      </section>


    </motion.div>
  );
}
