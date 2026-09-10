interface User {
  id?: string;
  username: string;
  password: string;
  role: 'Admin' | 'User';
  created_at: Date;
  updated_at?: Date;
}

export type { User };
