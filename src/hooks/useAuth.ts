import { useAuthStore } from '@/stores/auth.store';
import { User } from '@/types/auth.types';
import { isTokenValid } from '@/utils/jwt';

export interface UseAuthReturn {
  isAuth: boolean;
  user: User | null;
  role: 'Admin' | 'User' | null;
  isAdmin: boolean;
  isLoading: boolean;
  token: string | null;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const { token, user, isLoading, logout } = useAuthStore();

  const isTokenActive = isTokenValid(token);
  const isAuth = Boolean(token && isTokenActive && user);
  const role = user?.role ?? null;
  const isAdmin = role === 'Admin';

  return {
    isAuth,
    user,
    role,
    isAdmin,
    isLoading,
    token,
    logout,
  };
};

// Export alias direct si tu souhaites importer spécifiquement "useIsAuth"
export const useIsAuth = useAuth;
