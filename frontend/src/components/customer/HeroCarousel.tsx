import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: 'Discover the Future of Tech',
    subtitle: 'Premium gadgets designed for the modern lifestyle. Experience unparalleled performance.',
    image: 'https://images.unsplash.com/photo-1550009158-9effb6628286?auto=format&fit=crop&q=80&w=2000',
    link: '/products?category=Electronics',
    buttonText: 'Shop Electronics'
  },
  {
    id: 2,
    title: 'Elevate Your Workspace',
    subtitle: 'Minimalist, functional, and stylish accessories to boost your productivity.',
    image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=2000',
    link: '/products?category=Accessories',
    buttonText: 'Explore Accessories'
  },
  {
    id: 3,
    title: 'Immersive Audio Experience',
    subtitle: 'Crystal clear sound with our premium selection of headphones and speakers.',
    image: 'https://images.unsplash.com/photo-1511335513650-80e9a64a6b22?auto=format&fit=crop&q=80&w=2000',
    link: '/products?category=Audio',
    buttonText: 'Hear the Difference'
  }
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden rounded-[32px] bg-bg-primary shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/50 to-transparent z-10" />
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 max-w-3xl">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-text-primary mb-6 leading-tight"
            >
              {slides[current].title}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg md:text-xl text-text-secondary mb-8 font-space max-w-xl"
            >
              {slides[current].subtitle}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Link
                to={slides[current].link}
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-space font-bold uppercase tracking-wider text-bg-primary bg-primary rounded-full hover:bg-primary-hover hover:scale-105 transition-all shadow-[0_0_20px_rgba(21,216,255,0.4)]"
              >
                {slides[current].buttonText}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all opacity-0 md:opacity-100 hover:scale-110"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all opacity-0 md:opacity-100 hover:scale-110"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === idx ? 'w-8 bg-primary shadow-[0_0_10px_rgba(21,216,255,0.6)]' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
