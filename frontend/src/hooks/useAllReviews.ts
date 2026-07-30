import { useQuery } from '@tanstack/react-query';
import { getAllReviews } from '../api/reviewService';

export const useAllReviews = () => {
  return useQuery({
    queryKey: ['reviews', 'all'],
    queryFn: getAllReviews,
  });
};
