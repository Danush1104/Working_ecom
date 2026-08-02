import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';

const queryClient = new QueryClient({
 defaultOptions: {
 queries: {
 staleTime: 5 * 60 * 1000,
 retry: 1,
 refetchOnWindowFocus: false,
 },
 },
});

import { AuthProvider } from './context/AuthContext';

function App() {
 return (
 <QueryClientProvider client={queryClient}>
 <ThemeProvider>
 <AuthProvider>
 <WishlistProvider>
 <RouterProvider router={router} />
 <Toaster 
 position="bottom-right" 
 toastOptions={{
 className: '!bg-bg-card !text-text-primary shadow-lg border border-border-subtle dark:border-border-subtle',
 }}
 />
 </WishlistProvider>
 </AuthProvider>
 </ThemeProvider>
 </QueryClientProvider>
 );
}

export default App;
