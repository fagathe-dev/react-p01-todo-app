import { User } from '@/types/auth.types';
import { fetchAPI } from './fetchAPI';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  id: string;
  username: string;
  role: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

const AUTH_BASE_URL:string = '/auth';

export const fetchRegister = async (
  credentials: AuthCredentials
): Promise<RegisterResponse> => {
  const res = await fetchAPI<RegisterResponse>(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    body: credentials,
  });

  if (!res.ok) {
    throw new Error(
      (res.data as { message?: string })?.message ||
        "Erreur lors de l'inscription"
    );
  }

  return res.data;
};

export const fetchLogin = async (
  credentials: AuthCredentials
): Promise<AuthResponse> => {
  const res = await fetchAPI<AuthResponse>(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    body: credentials,
  });

  if (!res.ok) {
    throw new Error(
      (res.data as { message?: string })?.message || 'Identifiants invalides'
    );
  }

  return res.data;
};

export const fetchProfile = async (token?: string): Promise<User> => {
  const res = await fetchAPI<User>(`${AUTH_BASE_URL}/profile`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    throw new Error('Session expirée');
  }

  return res.data;
};
