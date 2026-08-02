import { motion } from 'framer-motion';
import { Star, MessageSquare, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAllReviews } from '../../hooks/useAllReviews';
import { SectionHeader } from '../../components/ui/SectionHeader';

export default function AllReviews() {
 const { data: reviews = [], isLoading } = useAllReviews();

 const activeReviews = reviews.filter(r => r.status === 'ACTIVE'|| r.status === undefined)
 .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

 return (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12"
 >
 <div className="pt-2">
 <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary dark:text-text-secondary hover:text-cyan-400 transition-colors focus:outline-none rounded-lg px-2 py-1 -ml-2">
 <ArrowLeft className="h-4 w-4" /> Back to Home
 </Link>
 </div>

 <section>
 <SectionHeader title="StoreFront Community Reviews" />
 
 {isLoading ? (
 <div className="flex justify-center py-20">
 <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
 </div>
 ) : activeReviews.length === 0 ? (
 <div className="text-center py-16 bg-bg-card/40 rounded-3xl border border-white/5">
 <MessageSquare className="h-16 w-16 mx-auto mb-6 text-text-secondary" />
 <p className="text-lg text-text-secondary font-medium">No reviews found.</p>
 </div>
 ) : (
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
 {activeReviews.map((review, idx) => (
 <motion.div 
 key={review.review_id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.05 }}
 className="p-6 bg-bg-card/60 hover:bg-bg-card/80 backdrop-blur-xl rounded-[24px] border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-soft"
 >
 <div className="flex justify-between items-start mb-4">
 <div className="flex gap-4">
 <div className="h-12 w-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg shrink-0">
 {review.user_name?.[0]?.toUpperCase() || 'U'}
 </div>
 <div>
 <p className="font-semibold text-white text-base leading-tight">{review.user_name || 'Anonymous User'}</p>
 <div className="flex items-center gap-2 mt-1">
 <div className="flex text-yellow-400">
 {[1, 2, 3, 4, 5].map(star => (
 <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-current': 'text-text-secondary'}`} />
 ))}
 </div>
 </div>
 </div>
 </div>
 
 <div className="text-right flex flex-col items-end">
 <div className="flex items-center gap-1 text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
 <CheckCircle2 className="w-3 h-3" />
 Verified
 </div>
 </div>
 </div>
 
 <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{review.review}</p>
 <div className="mt-4 text-xs font-medium text-text-secondary">
 {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </section>
 </motion.div>
 );
}
