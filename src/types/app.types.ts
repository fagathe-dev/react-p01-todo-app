import { User } from './auth.types';

export const tagColors = {
  red: '#e7000b',
  orange: '#f54900',
  yellow: '#fdc700',
  green: '#00a63e',
  cyan: '#0092b8',
  blue: '#155dfc',
  purple: '#9810fa',
  violet: '#7f22fe',
  fuchsia: '#c800de',
  pink: '#e60076',
  slate: '#45556c',
  gray: '#4a5565',
  stone: '#57534d',
} as const;

export type TagColor = keyof typeof tagColors;

export interface TaskTag {
  id: string;
  name: string;
  color?: TagColor | null;
  description?: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
  user?: User;
}

export interface Task {
  id: string;
  is_done?: boolean | number;
  name: string;
  description?: string | null;
  due_date?: 'today' | 'tomorrow' | 'this_week' | 'later' | null;
  created_at?: Date | string;
  updated_at?: Date | string;
  user?: User;
  tag?: TaskTag;
}
