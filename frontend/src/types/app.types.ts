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

export type ColorEnum = keyof typeof tagColors;

export type DueDateEnum = 'today' | 'tomorrow' | 'this_week' | 'later';

/**
 * Tag tel que renvoyé par l'API
 */
export interface TaskTag {
  id: string;
  name: string;
  color: ColorEnum | null;
  description?: string | null; // Présent dans tag.read
  createdAt?: string; // Présent dans tag.read
  updatedAt?: string | null; // Présent dans tag.read
}

/**
 * Tâche telle que renvoyée par l'API
 */
export interface Task {
  id: string;
  name: string;
  isDone: boolean;
  dueDate: string | null; // <-- Chaîne ISO venant de l'API (ou null)
  description?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  tag: TaskTag | null;
}

/**
 * Payloads envoyés à l'API (POST / PUT)
 */
export interface CreateTaskPayload {
  name: string;
  description?: string | null;
  dueDate?: string | null; // <-- ISO 8601 envoyé à Symfony
  tag?: string | null;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload> & {
  isDone?: boolean;
};

export interface CreateTagPayload {
  name: string;
  color: ColorEnum;
  description?: string | null;
}

export type UpdateTagPayload = Partial<CreateTagPayload>;
