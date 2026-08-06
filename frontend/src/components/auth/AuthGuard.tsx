import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GlobalPageLoader } from '../ui/Skeleton';

interface AuthGuardProps {
 requireAdmin?: boolean;
}

export function AuthGuard({ requireAdmin = false }: AuthGuardProps) {
 const { isAuthenticated, isLoading, user } = useAuth();
 const location = useLocation();

 if (isLoading) {
 return <GlobalPageLoader message="Authenticating session..." />;
 }

 if (!isAuthenticated) {
 return <Navigate to="/login" state={{ from: location }} replace />;
 }

 if (requireAdmin && !user?.isAdmin) {
 return <Navigate to="/" replace />;
 }

 return <Outlet />;
}

export function GuestGuard() {
 const { isAuthenticated, isLoading, user } = useAuth();

 if (isLoading) {
 return <GlobalPageLoader message="Verifying session..." />;
 }

 if (isAuthenticated) {
 if (user?.isAdmin) {
 return <Navigate to="/admin" replace />;
 }
 return <Navigate to="/" replace />;
 }

 return <Outlet />;
}
