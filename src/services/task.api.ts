import { CreateTaskPayload, Task, UpdateTaskPayload } from '@/types/app.types';

// Alias pour conserver la compatibilité avec les imports existants
export type TaskResponse = Task;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('todo_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_URL}/todos`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Erreur lors du chargement des tâches');
  return response.json();
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Erreur lors de la création de la tâche');
  return response.json();
};

export const updateTask = async (
  id: string,
  payload: UpdateTaskPayload
): Promise<Task> => {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok)
    throw new Error('Erreur lors de la mise à jour de la tâche');
  return response.json();
};
