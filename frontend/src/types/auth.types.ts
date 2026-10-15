export type RoleEnum = 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  id: string;
  email: string;
  roles: RoleEnum[];
  username: string;
  firstname?: string | null;
  lastname?: string | null;
  avatar?: string | null;
  isVerified?: boolean;
  hasJournalPasscode?: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export interface UpdateProfilePayload {
  username: string;
  firstname?: string | null;
  lastname?: string | null;
}

export interface ChangeEmailPayload {
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface SetJournalPasscodePayload {
  currentPasscode?: string;
  passcode: string;
}

export interface SetJournalPasscodeResponse {
  user: User;
  message: string;
}
