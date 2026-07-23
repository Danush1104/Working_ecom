import { createContext, useContext, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../api/wishlistService';
import toast from 'react-hot-toast';

export interface WishlistItem {
  product_id: string;
  user_id: string;
  created_at: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // We assume the auth interceptor attaches the token.
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      // In the context of our app, user_id is passed implicitly via token,
      // but our backend endpoint is /api/wishlist/{user_id}. 
      // We can use a special alias "me" if backend supports it, or we need to decode token.
      // Wait, our router uses event.claims.sub if user_id in path matches, OR we can hit /api/wishlist
      // Actually backend route for GET is /api/wishlist/{user_id}.
      // Let's decode token to get sub, or just rely on backend if we have an endpoint that doesn't need user_id in URL.
      // Actually backend: if target_user == user_id. We can decode the JWT to find sub.
      // Easiest is to fetch user info or decode token.
      
      const session = await import('aws-amplify/auth').then(m => m.fetchAuthSession()).catch(() => null);
      const sub = session?.tokens?.idToken?.payload?.sub;
      if (!sub) return [];
      
      const data = await getWishlist(sub);
      if (!Array.isArray(data)) return [];
      return data;
    },
    staleTime: 30000,
  });

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiAddToWishlist(productId);
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previous = queryClient.getQueryData(['wishlist']);
      
      const session = await import('aws-amplify/auth').then(m => m.fetchAuthSession()).catch(() => null);
      const sub = session?.tokens?.idToken?.payload?.sub || 'temp';

      queryClient.setQueryData(['wishlist'], (old: any) => [
        ...(old || []),
        { product_id: productId, user_id: sub, created_at: new Date().toISOString() }
      ]);
      return { previous };
    },
    onSuccess: () => {
      toast.success('Added to Wishlist', { icon: '❤️' });
    },
    onError: (_err, _productId, context: any) => {
      queryClient.setQueryData(['wishlist'], context?.previous);
      toast.error('Failed to add to wishlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const session = await import('aws-amplify/auth').then(m => m.fetchAuthSession()).catch(() => null);
      const sub = session?.tokens?.idToken?.payload?.sub;
      if (!sub) throw new Error("No user");
      return await apiRemoveFromWishlist(sub, productId);
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previous = queryClient.getQueryData(['wishlist']);
      queryClient.setQueryData(['wishlist'], (old: any) => 
        (old || []).filter((i: any) => i.product_id !== productId)
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Removed from Wishlist', { icon: '💔' });
    },
    onError: (_err, _productId, context: any) => {
      queryClient.setQueryData(['wishlist'], context?.previous);
      toast.error('Failed to remove from wishlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });

  const addToWishlist = (productId: string) => {
    if (!isInWishlist(productId)) {
      addMutation.mutate(productId);
    }
  };

  const removeFromWishlist = (productId: string) => {
    removeMutation.mutate(productId);
  };

  const isInWishlist = (productId: string) => {
    if (!Array.isArray(items)) return false;
    return items.some((i: any) => i.product_id === productId);
  };

  const items = Array.isArray(itemsData) ? itemsData : [];
  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, totalItems, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
