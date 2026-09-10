import { Task, TaskTag } from '@/types/app.types';
import { fetchAPI } from './fetchAPI';

export interface CreateTaskDto {
  name: string;
  description?: string;
  due_date?: Task['due_date'];
  tag_id?: string | null;
}

export interface UpdateTaskDto {
  name?: string;
  is_done?: boolean;
  description?: string | null;
  due_date?: Task['due_date'] | null;
  tag_id?: string | null;
}

export interface TaskResponse extends Omit<Task, 'tag'> {
  is_done?: boolean | number;
  description?: string | null;
  due_date?: Task['due_date'] | null;
  tag_id?: string | null;
  tag_name?: string | null;
  tag_color?: TaskTag['color'] | null;
}

export const fetchTasks = async (): Promise<TaskResponse[]> => {
  const res = await fetchAPI<TaskResponse[]>('/tasks');

  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des tâches');
  }

  return res.data ?? [];
};

export const fetchTaskById = async (id: string): Promise<TaskResponse> => {
  const res = await fetchAPI<TaskResponse>(`/tasks/${id}`);

  if (!res.ok) {
    throw new Error('Tâche introuvable');
  }

  return res.data;
};

export const fetchTasksByTag = async (
  tagId: string
): Promise<TaskResponse[]> => {
  const res = await fetchAPI<TaskResponse[]>(`/tags/${tagId}/tasks`);

  if (!res.ok) {
    throw new Error(
      'Erreur lors de la récupération des tâches associées au tag'
    );
  }

  return res.data ?? [];
};

export const createTask = async (dto: CreateTaskDto): Promise<TaskResponse> => {
  const res = await fetchAPI<TaskResponse>('/tasks', {
    method: 'POST',
    body: dto,
  });

  if (!res.ok) {
    throw new Error(
      (res.data as { message?: string })?.message ||
        'Erreur lors de la création de la tâche'
    );
  }

  return res.data;
};

export const updateTask = async (
  id: string,
  dto: UpdateTaskDto
): Promise<{ success: boolean }> => {
  const res = await fetchAPI<{ success: boolean }>(`/tasks/${id}`, {
    method: 'PUT',
    body: dto,
  });

  if (!res.ok) {
    throw new Error(
      (res.data as { message?: string })?.message ||
        'Erreur lors de la mise à jour'
    );
  }

  return res.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  const res = await fetchAPI(`/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(
      (res.data as { message?: string })?.message ||
        'Erreur lors de la suppression'
    );
  }
};
