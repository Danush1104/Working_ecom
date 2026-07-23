import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, AlertCircle } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { FilterDrawer } from '../../components/admin/FilterDrawer';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { AdminRefreshButton } from '../../components/ui/AdminRefreshButton';
import { DetailsDrawer } from '../../components/ui/DetailsDrawer';
import { Pagination } from '../../components/ui/Pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL.replace(/\/products$/, '');
const REVIEWS_API_URL = `${BASE_URL}/reviews`;

export default function Reviews() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  
  // Filters
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: reviews = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const res = await apiClient.get(`${REVIEWS_API_URL}/all`);
      return res.data?.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (review: any) => {
      await apiClient.delete(`${REVIEWS_API_URL}/${review.product_id}/${review.review_id}`);
    },
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setSelectedReview(null);
    },
    onError: () => toast.error('Failed to delete review')
  });

  const columns = [
    {
      header: 'Product ID',
      accessor: (item: any) => (
        <span className="font-mono text-xs">{item.product_id.slice(0,8)}...</span>
      )
    },
    {
      header: 'User ID',
      accessor: (item: any) => (
        <span className="font-mono text-xs">{item.user_id.slice(0,8)}...</span>
      )
    },
    {
      header: 'Rating',
      accessor: (item: any) => (
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="h-4 w-4 fill-current" />
          <span className="font-medium text-gray-900 dark:text-white">{item.rating}</span>
        </div>
      )
    },
    {
      header: 'Verified',
      accessor: (item: any) => (
        item.verified_purchase ? (
          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full font-medium">Verified</span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 text-xs rounded-full font-medium">Unverified</span>
        )
      )
    },
    {
      header: 'Date',
      accessor: (item: any) => new Date(item.created_at).toLocaleDateString()
    }
  ];

  const processedReviews = reviews.filter((r: any) => {
    let match = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      match = match && (r.product_id.toLowerCase().includes(q) || r.user_id.toLowerCase().includes(q) || r.review.toLowerCase().includes(q));
    }
    if (ratingFilter !== 'all') {
      match = match && r.rating.toString() === ratingFilter;
    }
    if (verifiedFilter !== 'all') {
      match = match && r.verified_purchase === (verifiedFilter === 'true');
    }
    return match;
  }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalPages = Math.ceil(processedReviews.length / itemsPerPage);
  const paginatedReviews = processedReviews.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-14 w-full" /><Skeleton className="h-64 w-full" /></div>;
  
  if (isError) return (
    <div className="flex h-[50vh] flex-col items-center justify-center text-red-500">
      <AlertCircle className="mb-4 h-12 w-12" />
      <h2 className="text-xl font-bold">Failed to load reviews</h2>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and moderate product reviews.</p>
        </div>
        <AdminRefreshButton onRefresh={refetch} isRefetching={isRefetching} />
      </div>

      <FilterBar 
        placeholder="Search reviews (Product, User, Text)..." 
        onSearch={(val) => { setSearchQuery(val); setPage(1); }}
        onFilterClick={() => setIsFilterOpen(true)}
      />

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Reviews"
        onReset={() => { setRatingFilter('all'); setVerifiedFilter('all'); }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
            <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800">
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select value={verifiedFilter} onChange={e => setVerifiedFilter(e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800">
              <option value="all">All</option>
              <option value="true">Verified Purchase</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>
      </FilterDrawer>

      {paginatedReviews.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No Reviews Found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <DataTable columns={columns} data={paginatedReviews} keyExtractor={(item: any) => item.review_id} />
          {totalPages > 1 && (
            <div className="mt-6 flex justify-end">
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
              />
            </div>
          )}
        </>
      )}

      <DetailsDrawer isOpen={!!selectedReview} onClose={() => setSelectedReview(null)} title="Review Details">
        {selectedReview && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Product ID</h4>
                <p className="text-sm font-mono dark:text-white break-all">{selectedReview.product_id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">User ID</h4>
                <p className="text-sm font-mono dark:text-white break-all">{selectedReview.user_id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Rating</h4>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-bold text-gray-900 dark:text-white">{selectedReview.rating}/5</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                {selectedReview.verified_purchase ? 'Verified Purchase' : 'Unverified'}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Review Content</h4>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 text-sm">
                {selectedReview.review || <span className="italic text-gray-500">No text provided.</span>}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button onClick={() => {
                if (confirm('Are you sure you want to delete this review?')) {
                  deleteMutation.mutate(selectedReview);
                }
              }} className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors">
                Delete Review
              </button>
              <button onClick={() => setSelectedReview(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                Close
              </button>
            </div>
          </div>
        )}
      </DetailsDrawer>
    </motion.div>
  );
}
