import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth.store';
import { Loading } from '@/ui/components/Feedback/Loading';
import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export interface ProtectedRouteProps {
  requiredRole?: 'Admin' | 'User';
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { isAuth, isLoading, role } = useAuth();
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (isLoading) {
    return (
      <div style={{ display: 'grid', height: '100vh', placeItems: 'center' }}>
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute };
