import { useAuth } from '@/hooks/useAuth';
import { RoleEnum } from '@/types/auth.types';
import { Loading } from '@/ui/components/Feedback/Loading';
import { Navigate, Outlet } from 'react-router-dom';

export interface ProtectedRouteProps {
  requiredRole?: RoleEnum;
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { isAuth, isLoading, role } = useAuth();

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

  if (requiredRole && !role?.includes(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute };
