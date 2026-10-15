import { Tag } from './tag.types';

type DueDateEnum = 'today' | 'tomorrow' | 'this_week' | 'later';

interface TodoFile {
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

interface TodoComment {
  id: string;
  content: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  owner?: {
    id: string;
    username: string;
    avatar?: string | null;
  } | null;
}

interface Todo {
  id: string;
  name: string;
  isDone: boolean;
  dueDate: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  tag: Tag | null;
  files?: TodoFile[];
  comments?: TodoComment[];
}

interface CreateTodoPayload {
  name: string;
}

interface UpdateTodoPayload {
  name?: string;
  description?: string | null;
  isDone?: boolean;
  dueDate?: string | null;
  tag?: string | null;
}

export type { CreateTodoPayload, DueDateEnum, Todo, TodoComment, TodoFile, UpdateTodoPayload };
