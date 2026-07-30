import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, AlertCircle } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { FilterBar } from '../../components/admin/FilterBar';
import { FilterDrawer } from '../../components/admin/FilterDrawer';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { AdminRefreshButton } from '../../components/ui/AdminRefreshButton';
import { useProducts } from '../../hooks/useProducts';
import { DetailDrawer } from '../../components/admin/DetailDrawer';
import { Pagination } from '../../components/ui/Pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import toast from 'react-hot-toast';
import { hideReview } from '../../api/reviewService';
import { exportToCSV } from '../../utils/csv';

const BASE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL.replace(/\/products$/, '');
const REVIEWS_API_URL = `${BASE_URL}/reviews`;

export default function Reviews() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const { data: products = [] } = useProducts();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
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

  const toggleVisibilityMutation = useMutation({
    mutationFn: async (review: any) => {
      await hideReview(review.review_id, review.product_id);
    },
    onSuccess: () => {
      toast.success('Review visibility toggled');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setSelectedReview(null);
    },
    onError: () => toast.error('Failed to toggle review visibility')
  });

  const columns = [
    {
      header: 'Product',
      accessor: (item: any) => {
        const product = products.find(p => p.id === item.product_id);
        const name = product ? product.name : item.product_id;
        return (
          <span className="font-medium text-gray-900 dark:text-white" title={name}>
            {name.length > 20 ? `${name.slice(0, 20)}...` : name}
          </span>
        );
      }
    },
    {
      header: 'Customer',
      accessor: (item: any) => (
        <span className="text-gray-600 dark:text-gray-300" title={item.user_name || item.user_id}>
          {(item.user_name || item.user_id).length > 15 ? `${(item.user_name || item.user_id).slice(0, 15)}...` : (item.user_name || item.user_id)}
        </span>
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
      header: 'Status',
      accessor: (item: any) => (
        item.status === 'HIDDEN' ? (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 text-xs rounded-full font-medium">Hidden</span>
        ) : (
          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full font-medium">Active</span>
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
        onDownload={() => exportToCSV(processedReviews, 'reviews.csv')}
      />

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Reviews"
        onReset={() => { setRatingFilter('all'); setVerifiedFilter('all'); }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Rating</label>
            <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="w-full rounded-lg border-border-subtle bg-bg-primary/50 text-white">
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <select value={verifiedFilter} onChange={e => setVerifiedFilter(e.target.value)} className="w-full rounded-lg border-border-subtle bg-bg-primary/50 text-white">
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
          <DataTable 
            columns={columns} 
            data={paginatedReviews} 
            keyExtractor={(item: any) => item.review_id} 
            onRowClick={(item) => {
              setSelectedReview(item);
              setIsViewModalOpen(true);
            }}
          />
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

      <DetailDrawer 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        title="Review Details"
        fields={selectedReview ? [
          { label: 'Product Name', value: products.find(p => p.id === selectedReview.product_id)?.name || selectedReview.product_id },
          { label: 'Customer', value: selectedReview.user_name || selectedReview.user_id },
          { label: 'User ID', value: selectedReview.user_id },
          { label: 'Rating', value: `${selectedReview.rating} / 5 Stars` },
          { label: 'Status', value: selectedReview.verified_purchase ? 'Verified Purchase' : 'Unverified' },
          { label: 'Visibility', value: selectedReview.status },
          { label: 'Date', value: new Date(selectedReview.created_at).toLocaleString() },
          { label: 'Review Text', value: selectedReview.review || 'No text provided.' },
          { 
            label: 'Actions', 
            value: (
              <div className="flex gap-2 mt-2">
                <button onClick={() => {
                  if (confirm('Are you sure you want to delete this review?')) {
                    deleteMutation.mutate(selectedReview);
                    setIsViewModalOpen(false);
                  }
                }} className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors">
                  Delete
                </button>
                <button onClick={() => {
                  toggleVisibilityMutation.mutate(selectedReview);
                  setIsViewModalOpen(false);
                }} className="px-4 py-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg hover:bg-orange-200 transition-colors">
                  {selectedReview.status === 'HIDDEN' ? 'Unhide' : 'Hide'}
                </button>
              </div>
            )
          }
        ] : []}
      />
    </motion.div>
  );
}
