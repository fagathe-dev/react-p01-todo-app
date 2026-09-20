import { useAuthStore } from '@/stores/auth.store';
import { RoleEnum, User } from '@/types/auth.types';
import { isTokenValid } from '@/utils/jwt';

export interface UseAuthReturn {
  isAuth: boolean;
  user: User | null;
  role?: Array<RoleEnum>;
  isAdmin: boolean;
  isLoading: boolean;
  token: string | null;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const { token, user, isLoading, logout } = useAuthStore();

  const isTokenActive = isTokenValid(token);
  const isAuth = Boolean(token && isTokenActive && user);
  const role = user?.roles;
  const isAdmin = role !== undefined ? role.includes('ROLE_ADMIN') : false;

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
