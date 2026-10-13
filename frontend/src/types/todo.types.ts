import { Tag } from './tag.types';

export type DueDateEnum = 'today' | 'tomorrow' | 'this_week' | 'later';

export interface TodoFile {
  id: string;
  originalName: string;
  niceName?: string | null;
  filePath: string;
  mimeType: string;
  type?: string | null;
  extension: string;
  size: number;
  createdAt: string;
  updatedAt?: string | null;
  isPinned: boolean;
}

export interface Todo {
  id: string;
  name: string;
  isDone: boolean;
  dueDate: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  tag: Tag | null;
  files?: TodoFile[]; // Inclus si le groupe 'todo.read' est utilisé
}

export interface CreateTodoPayload {
  name: string;
  description?: string | null;
  dueDate?: string | null;
  tag?: string | null; // L'identifiant (UUID) du tag
}

export type UpdateTodoPayload = Partial<CreateTodoPayload> & {
  isDone?: boolean;
};