import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/ui/components/Feedback/Loading';
import { Navigate, Outlet } from 'react-router-dom';

export const PublicRoute = () => {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'grid', height: '100vh', placeItems: 'center' }}>
        <Loading size="lg" />
      </div>
    );
  }

  if (isAuth) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
