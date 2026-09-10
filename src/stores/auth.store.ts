import { fetchProfile } from '@/services/auth.api';
import { User } from '@/types/auth.types';
import { isTokenValid } from '@/utils/jwt';
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const TOKEN_KEY = 'todo_auth_token';

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  isLoading: true,

  setAuth: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, isLoading: false });
  },

  checkSession: async () => {
    const { token, logout } = get();

    if (!token || !isTokenValid(token)) {
      logout();
      return;
    }

    try {
      set({ isLoading: true });
      const user = await fetchProfile(token);
      set({ user, isLoading: false });
    } catch {
      logout();
    }
  },
}));
