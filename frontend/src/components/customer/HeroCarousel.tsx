import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
 {
 id: 1,
 title:"The Future of Shopping",
 subtitle:"Experience the next generation of premium electronics.",
 image:"/images/banner1.png",
 link:"/products?category=Electronics",
 primaryAction:"Shop Now",
 secondaryAction:"Explore Collection"
 },
 {
 id: 2,
 title:"Audio Perfection",
 subtitle:"Immersive sound engineered for audiophiles.",
 image:"/images/banner2.png",
 link:"/products?category=Audio",
 primaryAction:"Listen Now",
 secondaryAction:"View Features"
 }
];

export function HeroCarousel() {
 const [currentSlide, setCurrentSlide] = useState(0);

 const nextSlide = () => {
 setCurrentSlide((prev) => (prev + 1) % slides.length);
 };

 const prevSlide = () => {
 setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
 };

 useEffect(() => {
 const timer = setInterval(nextSlide, 5000);
 return () => clearInterval(timer);
 }, []);

 return (
 <div className="relative h-[70vh] sm:h-[80vh] w-full overflow-hidden group">
 <AnimatePresence mode="wait">
 <motion.div
 key={currentSlide}
 initial={{ opacity: 0, scale: 1.05 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.7, ease:"easeOut" }}
 className="absolute inset-0"
 >
 {/* Image */}
 <div className="absolute inset-0">
 <img
 src={slides[currentSlide].image}
 alt={slides[currentSlide].title}
 className="w-full h-full object-cover"
 />
 {/* Premium Dark Gradient Overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent" />
 <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/80 via-transparent to-transparent" />
 </div>

 {/* Content Container */}
 <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
 <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
 <motion.div 
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2, duration: 0.8, ease:"easeOut" }}
 className="max-w-2xl space-y-6"
 >
 <h2 className="text-4xl sm:text-5xl lg:text-7xl font-playfair font-bold text-white leading-tight tracking-tight drop-shadow-2xl">
 {slides[currentSlide].title}
 </h2>
 
 <p className="text-lg sm:text-xl text-white font-medium max-w-lg leading-relaxed drop-shadow-md">
 {slides[currentSlide].subtitle}
 </p>
 
 <div className="flex flex-wrap items-center gap-4 pt-4">
 <Link to={slides[currentSlide].link}>
 <motion.button 
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 className="h-14 px-8 rounded-full bg-cyan-500 text-bg-primary font-bold text-base flex items-center gap-2 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all"
 >
 {slides[currentSlide].primaryAction}
 <ArrowRight className="w-5 h-5" />
 </motion.button>
 </Link>
 
 <Link to={slides[currentSlide].link}>
 <motion.button 
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 className="h-14 px-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-base flex items-center hover:bg-white/20 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
 >
 {slides[currentSlide].secondaryAction}
 </motion.button>
 </Link>
 </div>
 </motion.div>
 </div>
 </div>
 </motion.div>
 </AnimatePresence>

 {/* Navigation Arrows */}
 <div className="absolute bottom-8 right-8 sm:bottom-1/2 sm:translate-y-1/2 sm:right-auto sm:left-0 sm:w-full sm:flex sm:justify-between sm:px-8 z-20 pointer-events-none hidden md:flex">
 <button
 onClick={prevSlide}
 className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white/20 hover:border-cyan-500/50 transition-all pointer-events-auto opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
 >
 <ChevronLeft className="w-6 h-6" />
 </button>
 <button
 onClick={nextSlide}
 className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white/20 hover:border-cyan-500/50 transition-all pointer-events-auto opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
 >
 <ChevronRight className="w-6 h-6" />
 </button>
 </div>

 {/* Indicators */}
 <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
 {slides.map((_, index) => (
 <button
 key={index}
 onClick={() => setCurrentSlide(index)}
 className={`transition-all duration-500 rounded-full ${
 currentSlide === index 
 ? 'w-10 h-2 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
 : 'w-2 h-2 bg-bg-card/40 hover:bg-bg-card/60'
 }`}
 />
 ))}
 </div>
 </div>
 );
}
