export type RoleEnum = 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  id: string;
  email: string;
  roles: RoleEnum[];
  username: string;
  firstname?: string | null;
  lastname?: string | null;
  avatar?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export interface LoginResponse {
  token: string;
}
