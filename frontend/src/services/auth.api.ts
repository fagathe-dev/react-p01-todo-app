import {
  AuthResponse,
  ChangeEmailPayload,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  SetJournalPasscodePayload,
  SetJournalPasscodeResponse,
  UpdateProfilePayload,
  User,
} from '@/types/auth.types';
import { fetchAPI } from './fetchAPI';

const AUTH_BASE_URL = '/auth';
const ACCOUNT_BASE_URL = '/account';

const extractErrorMessage = (data: unknown, fallback: string): string => {
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (obj.errors && typeof obj.errors === 'object') {
      const firstErr = Object.values(obj.errors)[0];
      if (typeof firstErr === 'string') return firstErr;
      if (Array.isArray(firstErr) && typeof firstErr[0] === 'string') return firstErr[0];
    }
  }
  return fallback;
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth (/auth)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchRegister = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const res = await fetchAPI<RegisterResponse>(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    body: payload,
  });

  if (!res.ok) {
    throw new Error(extractErrorMessage(res.data, "Erreur lors de l'inscription"));
  }

  return res.data;
};

export const fetchLogin = async (credentials: LoginPayload): Promise<AuthResponse> => {
  const res = await fetchAPI<AuthResponse>(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    body: credentials,
  });

  if (!res.ok) {
    throw new Error(extractErrorMessage(res.data, 'Identifiants invalides'));
  }

  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Account & Profile (/account)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchProfile = async (token?: string): Promise<User> => {
  const res = await fetchAPI<User>(`${ACCOUNT_BASE_URL}/profile`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    throw new Error('Session expirée');
  }

  return res.data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  const res = await fetchAPI<User>(`${ACCOUNT_BASE_URL}/profile`, {
    method: 'PUT',
    body: payload,
  });

  if (!res.ok) {
    throw new Error(extractErrorMessage(res.data, 'Erreur lors de la mise à jour des informations'));
  }

  return res.data;
};

export const updateAvatar = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('avatar', file, file.name);

  const res = await fetchAPI<User>(`${ACCOUNT_BASE_URL}/avatar`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(extractErrorMessage(res.data, "Erreur lors de la mise à jour de l'avatar"));
  }

  return res.data;
};

export const updateEmail = async (payload: ChangeEmailPayload): Promise<User> => {
  const res = await fetchAPI<User>(`${ACCOUNT_BASE_URL}/email`, {
    method: 'PUT',
    body: payload,
  });

  if (!res.ok) {
    throw new Error(extractErrorMessage(res.data, "Erreur lors de la modification de l'adresse e-mail"));
  }

  return res.data;
};

export const updatePassword = async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
  const res = await fetchAPI<{ message: string }>(`${ACCOUNT_BASE_URL}/password`, {
    method: 'PUT',
    body: payload,
  });

  if (!res.ok) {
    throw new Error(extractErrorMessage(res.data, 'Erreur lors de la modification du mot de passe'));
  }

  return res.data;
};

export const deleteAccount = async (): Promise<void> => {
  const res = await fetchAPI(`${ACCOUNT_BASE_URL}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(extractErrorMessage(res.data, 'Erreur lors de la suppression du compte'));
  }
};

export const updateJournalPasscode = async (
  payload: SetJournalPasscodePayload
): Promise<SetJournalPasscodeResponse> => {
  const res = await fetchAPI<SetJournalPasscodeResponse>(`${ACCOUNT_BASE_URL}/journal-passcode`, {
    method: 'PUT',
    body: payload,
  });

  if (!res.ok) {
    throw new Error(extractErrorMessage(res.data, 'Erreur lors de la configuration du code secret'));
  }

  return res.data;
};
