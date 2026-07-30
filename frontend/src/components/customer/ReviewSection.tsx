import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Edit2, Trash2, CheckCircle2, ThumbsUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getProductReviews, addReview, updateReview, deleteReview } from '../../api/reviewService';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const ReviewSection = ({ productId, product }: { productId: string, product: any }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  
  // Write Review State
  const [isWriting, setIsWriting] = useState(false);
  const [writeRating, setWriteRating] = useState(5);
  const [writeText, setWriteText] = useState('');
  
  // Edit Review State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => getProductReviews(productId)
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => addReview(data),
    onSuccess: () => {
      toast.success('Review added successfully');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] }); // Update product stats
      setIsWriting(false);
      setWriteText('');
      setWriteRating(5);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add review')
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateReview(data.review_id, { product_id: productId, rating: data.rating, review: data.review }),
    onSuccess: () => {
      toast.success('Review updated successfully');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setEditingReviewId(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update review')
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId, productId),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete review')
  });

  const averageRating = product?.average_rating || 0;
  const totalReviews = product?.total_reviews || 0;
  const dist = product?.rating_distribution || { "5":0, "4":0, "3":0, "2":0, "1":0 };

  let filteredReviews = reviews.filter(r => r.status === 'ACTIVE' || r.status === undefined);
  if (ratingFilter) {
    filteredReviews = filteredReviews.filter(r => r.rating === ratingFilter);
  }
  
  filteredReviews.sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortOrder === 'highest') return b.rating - a.rating;
    if (sortOrder === 'lowest') return a.rating - b.rating;
    return 0;
  });

  const userHasReviewed = reviews.some(r => r.user_id === user?.userId);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-playfair font-bold text-white flex items-center gap-3">
          Customer Reviews 
          <span className="text-sm font-space font-medium text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full">
            {totalReviews} Total
          </span>
        </h2>
      </div>
      
      <div className="grid lg:grid-cols-12 gap-12">
        {/* Statistics Column */}
        <div className="lg:col-span-4 space-y-8 bg-bg-card/40 backdrop-blur-md p-8 rounded-3xl border border-white/5">
          <div className="flex items-center gap-6">
            <div className="text-6xl font-bold text-white tracking-tight">{averageRating.toFixed(1)}</div>
            <div className="space-y-1">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`h-6 w-6 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-700'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-400 font-medium">Based on {totalReviews} reviews</p>
            </div>
          </div>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(star => {
              const count = dist[star.toString()] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              const isActive = ratingFilter === star;
              return (
                <button 
                  key={star}
                  onClick={() => setRatingFilter(isActive ? null : star)}
                  className={`w-full flex items-center gap-4 text-sm group transition-all p-2 rounded-xl
                    ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                  `}
                >
                  <div className="w-16 font-medium text-gray-300 flex items-center gap-1">
                    {star} <Star className="w-3 h-3 fill-current text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-cyan-500 rounded-full group-hover:bg-cyan-400 transition-colors" 
                    />
                  </div>
                  <div className="w-10 text-right text-gray-400">{count}</div>
                </button>
              );
            })}
          </div>
          
          {ratingFilter && (
            <button onClick={() => setRatingFilter(null)} className="text-sm text-cyan-400 font-medium hover:text-cyan-300 transition-colors">
              Clear filters
            </button>
          )}

          {!userHasReviewed && (
            <div className="pt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Share your thoughts</h3>
              <p className="text-sm text-gray-400 mb-6">If you've used this product, share your thoughts with other customers.</p>
              <button 
                onClick={() => {
                  if (!isAuthenticated) return toast.error('Please login to write a review');
                  setIsWriting(!isWriting);
                }}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold text-white hover:bg-white/10 hover:border-cyan-500/30 transition-all shadow-lg shadow-black/20"
              >
                Write a Review
              </button>
            </div>
          )}
        </div>

        {/* Reviews List Column */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence>
            {isWriting && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-8 bg-bg-card/60 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-[0_8px_32px_rgba(21,216,255,0.1)] mb-8 overflow-hidden"
              >
                <h3 className="text-xl font-bold text-white mb-6">Write your review</h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setWriteRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                        <Star className={`h-10 w-10 ${star <= writeRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">Your Review</label>
                  <textarea 
                    rows={4}
                    value={writeText}
                    onChange={e => setWriteText(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none outline-none"
                    placeholder="What did you like or dislike? What did you use this product for?"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button onClick={() => setIsWriting(false)} className="px-6 py-3 font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
                  <button 
                    onClick={() => addMutation.mutate({ product_id: productId, rating: writeRating, review: writeText })}
                    disabled={addMutation.isPending || !writeText.trim()}
                    className="px-8 py-3 bg-cyan-500 text-bg-primary font-bold rounded-full hover:bg-cyan-400 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all"
                  >
                    {addMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h3 className="font-semibold text-white">
              Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
            </h3>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-bg-primary border border-white/10 text-gray-300 text-sm rounded-full px-4 py-2 focus:ring-1 focus:ring-cyan-500 outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 animate-pulse rounded-3xl" />)}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-16 bg-bg-card/40 rounded-3xl border border-white/5">
              <MessageSquare className="h-16 w-16 mx-auto mb-6 text-gray-700" />
              <p className="text-lg text-gray-400 font-medium">No reviews found.</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or be the first to review.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={review.review_id} 
                  className="p-6 bg-bg-card/40 hover:bg-bg-card/60 backdrop-blur-md rounded-3xl border border-white/5 transition-all"
                >
                  {editingReviewId === review.review_id ? (
                     <div className="space-y-4">
                       <div className="flex gap-2">
                         {[1, 2, 3, 4, 5].map(star => (
                           <button key={star} onClick={() => setWriteRating(star)}>
                             <Star className={`h-8 w-8 ${star <= writeRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} />
                           </button>
                         ))}
                       </div>
                       <textarea 
                         rows={3}
                         value={writeText}
                         onChange={e => setWriteText(e.target.value)}
                         className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
                       />
                       <div className="flex gap-3">
                         <button onClick={() => updateMutation.mutate({ review_id: review.review_id, rating: writeRating, review: writeText })} className="px-6 py-2 bg-cyan-500 text-bg-primary font-bold rounded-full">Save Changes</button>
                         <button onClick={() => setEditingReviewId(null)} className="px-6 py-2 text-gray-400 font-medium hover:text-white">Cancel</button>
                       </div>
                     </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
                            {review.user_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-base">{review.user_name || 'Anonymous User'}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'text-gray-700'}`} />
                                ))}
                              </div>
                              <span className="text-xs font-medium text-gray-500">• {new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Verified Badge & Purchase Info */}
                        <div className="text-right flex flex-col items-end">
                           <div className="flex items-center gap-1 text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full text-xs font-semibold">
                             <CheckCircle2 className="w-3.5 h-3.5" />
                             Verified Buyer
                           </div>
                           <span className="text-[11px] text-gray-500 mt-1.5 font-medium">Purchased 2 months ago</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-[15px] leading-relaxed whitespace-pre-wrap ml-16">{review.review}</p>
                      
                      <div className="mt-5 ml-16 flex items-center justify-between">
                        <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-cyan-400 transition-colors">
                          <ThumbsUp className="w-4 h-4" /> Helpful
                        </button>
                        
                        {user?.userId === review.user_id && (
                          <div className="flex gap-4">
                            <button onClick={() => {
                              setEditingReviewId(review.review_id);
                              setWriteRating(review.rating);
                              setWriteText(review.review);
                            }} className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors">
                              <Edit2 className="h-4 w-4" /> Edit
                            </button>
                            <button onClick={() => {
                              if (confirm('Are you sure you want to delete this review?')) deleteMutation.mutate(review.review_id);
                            }} className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
