export type RoleEnum = 'ROLE_ADMIN' | 'ROLE_USER';

export interface User {
  id: string;
  email: string;
  username: string;
  roles: RoleEnum[];
  createdAt: string;
  updatedAt: string | null;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export interface LoginResponse {
  token: string;
}
