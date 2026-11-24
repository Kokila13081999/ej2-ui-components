import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/** Only renders child routes when a valid token exists; otherwise redirects to login. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Login page is only for signed-out users; after login, return to the page they asked for. */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  if (!isAuthenticated) return <Outlet />;
  return <Navigate to={from && from !== '/login' ? from : '/dashboard'} replace />;
}
