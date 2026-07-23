import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../customer/ProductCard';
import type { Product } from '../../api/productService';

interface ProductSliderProps {
  products: Product[];
  title?: string;
}

export function ProductSlider({ products, title }: ProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group">
      {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-playfair">{title}</h2>}
      
      {/* Scroll Buttons */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 p-3 bg-white/90 dark:bg-gray-800/90 shadow-xl border border-gray-100 dark:border-gray-700 rounded-full text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 p-3 bg-white/90 dark:bg-gray-800/90 shadow-xl border border-gray-100 dark:border-gray-700 rounded-full text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slider Container */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-2 -mx-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.5) }}
            className="snap-start shrink-0 w-[280px] sm:w-[320px]"
          >
            <ProductCard {...product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
