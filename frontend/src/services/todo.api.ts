// src/services/todo.api.ts
import {
  CreateTodoPayload,
  Todo,
  TodoComment,
  UpdateTodoPayload,
} from '@/types/todo.types';
import { fetchAPI } from './fetchAPI';

const extractApiError = (data: unknown, fallback: string): string => {
  if (!data || typeof data !== 'object') return fallback;

  const err = data as Record<string, any>;
  if (err.message && typeof err.message === 'string') return err.message;
  if (err.error && typeof err.error === 'string') return err.error;

  if (Array.isArray(err.violations) && err.violations.length > 0) {
    return err.violations
      .map((v: any) => v.message || v.title || JSON.stringify(v))
      .join(' — ');
  }

  // Dictionnaire de violations { champ: "Message d'erreur" }
  const values = Object.values(err);
  if (values.length > 0 && typeof values[0] === 'string') {
    return values.join(' — ');
  }

  return fallback;
};

export const fetchTodos = async (): Promise<Todo[]> => {
  const res = await fetchAPI<Todo[]>('/todos');
  if (!res.ok) throw new Error(extractApiError(res.data, 'Erreur lors du chargement des tâches.'));
  return res.data ?? [];
};

export const createTodo = async (payload: CreateTodoPayload): Promise<Todo> => {
  const res = await fetchAPI<Todo>('/todos', {
    method: 'POST',
    body: payload,
  });
  if (!res.ok) throw new Error(extractApiError(res.data, 'Erreur lors de la création de la tâche.'));
  return res.data;
};

export const updateTodo = async (
  id: string,
  payload: UpdateTodoPayload | FormData
): Promise<Todo> => {
  const res = await fetchAPI<Todo>(`/todos/${id}`, {
    method: 'POST',
    body: payload,
  });
  if (!res.ok) throw new Error(extractApiError(res.data, 'Erreur lors de la mise à jour de la tâche.'));
  return res.data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  const res = await fetchAPI(`/todos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(extractApiError(res.data, 'Erreur lors de la suppression de la tâche.'));
};

export const deleteTodoFile = async (todoId: string, fileId: string): Promise<void> => {
  const res = await fetchAPI(`/todos/${todoId}/files/${fileId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(extractApiError(res.data, 'Erreur lors de la suppression du fichier.'));
};

export const addTodoComment = async (todoId: string, content: string): Promise<TodoComment> => {
  const res = await fetchAPI<TodoComment>(`/todos/${todoId}/comments`, {
    method: 'POST',
    body: { content },
  });
  if (!res.ok) throw new Error(extractApiError(res.data, "Erreur lors de l'ajout du commentaire."));
  return res.data;
};

export const deleteTodoComment = async (todoId: string, commentId: string): Promise<void> => {
  const res = await fetchAPI(`/todos/${todoId}/comments/${commentId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(extractApiError(res.data, 'Erreur lors de la suppression du commentaire.'));
};