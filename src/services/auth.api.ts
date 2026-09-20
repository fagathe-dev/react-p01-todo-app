import { RegisterResponse, User } from '@/types/auth.types';
import { fetchAPI } from './fetchAPI';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  username: string; // Accepte soit l'email, soit le pseudo
  password: string;
}

const AUTH_BASE_URL = '/auth';

export const fetchRegister = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const res = await fetchAPI<RegisterResponse>(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    body: payload,
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
  credentials: LoginPayload
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
