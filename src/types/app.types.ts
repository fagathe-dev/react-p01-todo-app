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

export type TagColorEnum = keyof typeof tagColors;

export type DueDateEnum = 'today' | 'tomorrow' | 'this_week' | 'later';

/**
 * Tag tel que renvoyé par l'API
 */
export interface TaskTag {
  id: string;
  name: string;
  color: TagColorEnum | null;
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
  dueDate: DueDateEnum | null;
  description?: string | null; // Présent dans todo.read
  createdAt?: string; // Présent dans todo.read
  updatedAt?: string | null; // Présent dans todo.read
  tag: TaskTag | null;
}

/**
 * Payloads envoyés à l'API (POST / PUT)
 */
export interface CreateTaskPayload {
  name: string;
  description?: string | null;
  dueDate?: DueDateEnum | null;
  tag?: string | null; // UUID du tag sélectionné
}

export type UpdateTaskPayload = Partial<CreateTaskPayload> & {
  isDone?: boolean;
};

export interface CreateTagPayload {
  name: string;
  color: TagColorEnum;
  description?: string | null;
}

export type UpdateTagPayload = Partial<CreateTagPayload>;
